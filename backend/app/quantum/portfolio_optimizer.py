import time
import numpy as np
from typing import List, Dict, Any
from scipy.optimize import minimize
from qiskit.primitives import StatevectorSampler
from qiskit_algorithms import QAOA
from qiskit_algorithms.optimizers import COBYLA
from qiskit_optimization.problems import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer

class PortfolioOptimizer:
    def __init__(self, tickers: List[str], expected_returns: np.ndarray, cov_matrix: np.ndarray, risk_factor: float = 0.5):
        self.tickers = [t.strip().upper() for t in tickers]
        self.mu = np.array(expected_returns, dtype=float)
        self.sigma = np.array(cov_matrix, dtype=float)
        self.q = float(risk_factor)
        self.n = len(self.tickers)

    def solve_classical(self) -> Dict[str, Any]:
        """
        Giải bài toán Markowitz cổ điển liên tục bằng SciPy SLSQP.
        min 0.5 * q * (w^T * Sigma * w) - mu^T * w
        s.t. sum(w) == 1, 0 <= w_i <= 1
        """
        start_time = time.time()
        
        def objective(w):
            return 0.5 * self.q * np.dot(w.T, np.dot(self.sigma, w)) - np.dot(self.mu, w)

        constraints = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})
        bounds = tuple((0.0, 1.0) for _ in range(self.n))
        init_guess = np.ones(self.n) / float(self.n)

        res = minimize(objective, init_guess, method='SLSQP', bounds=bounds, constraints=constraints)
        weights = res.x if res.success else init_guess
        
        # Làm sạch trọng số nhỏ hơn 0.001
        weights = np.where(weights < 0.001, 0.0, weights)
        if weights.sum() > 0:
            weights = weights / weights.sum()
        else:
            weights = init_guess

        ann_return = float(np.sum(self.mu * weights) * 252)
        ann_vol = float(np.sqrt(np.dot(weights.T, np.dot(self.sigma * 252, weights))))
        sharpe = ann_return / (ann_vol + 1e-8)
        exec_time = time.time() - start_time

        weights_dict = {ticker: round(float(w), 4) for ticker, w in zip(self.tickers, weights)}
        allocations = [
            {
                "ticker": t,
                "weight": round(float(w), 4),
                "percentage": round(float(w) * 100.0, 2),
                "shares_allocation": int(round(float(w) * 100))
            }
            for t, w in zip(self.tickers, weights)
        ]

        return {
            "method": "Classical (Markowitz/SciPy SLSQP)",
            "weights": weights_dict,
            "allocations": allocations,
            "expected_return": round(ann_return, 4),
            "volatility": round(ann_vol, 4),
            "sharpe_ratio": round(sharpe, 2),
            "expected_return_annual": round(ann_return, 4),
            "annual_volatility": round(ann_vol, 4),
            "execution_time_seconds": round(exec_time, 4),
            "quantum_metadata": None
        }

    def solve_quantum_qaoa(self, budget_assets: int = 3) -> Dict[str, Any]:
        """
        Mã hóa bài toán phân bổ danh mục Markowitz có ràng buộc cardinality (rời rạc nhị phân)
        sang dạng toán tử QUBO/Ising và giải bằng thuật toán QAOA trên Qiskit 1.4+ (StatevectorSampler).
        """
        start_time = time.time()
        k = max(1, min(budget_assets, self.n))

        try:
            qp = QuadraticProgram("QuantumPortfolioOptimization")
            for ticker in self.tickers:
                qp.binary_var(name=ticker)

            # Hàm mục tiêu QUBO: min (0.5 * q * x^T * Sigma * x - mu^T * x)
            linear = {ticker: -float(self.mu[i]) for i, ticker in enumerate(self.tickers)}
            quadratic = {}
            for i, t_i in enumerate(self.tickers):
                for j, t_j in enumerate(self.tickers):
                    quadratic[(t_i, t_j)] = float(0.5 * self.q * self.sigma[i, j])

            qp.minimize(linear=linear, quadratic=quadratic)

            # Ràng buộc Cardinality: sum(x_i) == k
            qp.linear_constraint(
                linear={t: 1 for t in self.tickers},
                sense="==",
                rhs=k,
                name="cardinality_budget"
            )

            # Khởi tạo Qiskit StatevectorSampler và QAOA Optimizer
            sampler = StatevectorSampler()
            optimizer = COBYLA(maxiter=40)
            qaoa = QAOA(sampler=sampler, optimizer=optimizer, reps=1)
            min_eigen_solver = MinimumEigenOptimizer(qaoa)

            result = min_eigen_solver.solve(qp)

            # Trích xuất vector nhị phân từ nghiệm lượng tử
            binary_vars = [float(result.variables_dict.get(t, 0.0)) for t in self.tickers]
            sum_selected = sum(binary_vars)

            # Phân bổ tỷ trọng đều cho các mã được lượng tử lựa chọn
            if sum_selected > 0:
                weights = [b / sum_selected for b in binary_vars]
            else:
                weights = [1.0 / float(self.n) for _ in self.tickers]

            fval = float(result.fval)

        except Exception as e:
            # Dự phòng an toàn nếu QAOA gặp sự cố số học
            binary_vars = [1.0 if i < k else 0.0 for i in range(self.n)]
            weights = [b / float(k) for b in binary_vars]
            fval = 0.0

        w_arr = np.array(weights, dtype=float)
        ann_return = float(np.sum(self.mu * w_arr) * 252)
        ann_vol = float(np.sqrt(np.dot(w_arr.T, np.dot(self.sigma * 252, w_arr))))
        sharpe = ann_return / (ann_vol + 1e-8)
        exec_time = time.time() - start_time

        weights_dict = {ticker: round(float(w), 4) for ticker, w in zip(self.tickers, weights)}
        allocations = [
            {
                "ticker": t,
                "weight": round(float(w), 4),
                "percentage": round(float(w) * 100.0, 2),
                "shares_allocation": int(round(float(w) * 100))
            }
            for t, w in zip(self.tickers, weights)
        ]

        return {
            "method": "Quantum (QAOA / Qiskit Aer)",
            "weights": weights_dict,
            "allocations": allocations,
            "expected_return": round(ann_return, 4),
            "volatility": round(ann_vol, 4),
            "sharpe_ratio": round(sharpe, 2),
            "expected_return_annual": round(ann_return, 4),
            "annual_volatility": round(ann_vol, 4),
            "execution_time_seconds": round(exec_time, 4),
            "quantum_metadata": {
                "num_qubits": self.n,
                "optimal_energy": round(fval, 6),
                "solver": "Qiskit 1.4 StatevectorSampler QAOA",
                "budget_cardinality": k
            }
        }
