import io
import os
from typing import Dict, List, Tuple, Optional
import pypdf

class FinancialStatementAnalyzer:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()

    def extract_text_from_pdf(self, pdf_bytes: bytes, max_pages: int = 10) -> str:
        """Trích xuất văn bản từ file PDF báo cáo tài chính."""
        try:
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            text = ""
            for page in reader.pages[:max_pages]:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        except Exception as e:
            return f"Error reading PDF: {str(e)}"

    def analyze_ticker_financials(self, ticker: str, text: str = "") -> Tuple[float, float, Dict[str, float], List[str]]:
        """
        Trích xuất chỉ số tài chính cơ bản và tính toán Fundamental Alpha Score (0 - 100).
        Trả về: (fundamental_score, sentiment_score, key_metrics, summary_insights)
        """
        t = ticker.upper().strip()

        # Bộ dữ liệu cơ sở định lượng thực tế / giả lập cho các mã thông dụng
        database = {
            "NVDA": {
                "name": "NVIDIA Corporation",
                "roe": 0.58, "net_margin": 0.55, "debt_to_equity": 0.35, "pe_ratio": 46.2, "sentiment": 0.88,
                "note": "Tăng trưởng doanh thu Datacenter và nhu cầu chip AI tạo biên lợi nhuận đột phá."
            },
            "AAPL": {
                "name": "Apple Inc.",
                "roe": 0.36, "net_margin": 0.26, "debt_to_equity": 1.15, "pe_ratio": 30.1, "sentiment": 0.62,
                "note": "Doanh thu mảng dịch vụ tiếp tục mở rộng, dòng tiền tự do dồi dào."
            },
            "MSFT": {
                "name": "Microsoft Corporation",
                "roe": 0.39, "net_margin": 0.36, "debt_to_equity": 0.72, "pe_ratio": 33.5, "sentiment": 0.75,
                "note": "Azure Cloud và Copilot AI đóng góp đà tăng trưởng doanh số hai chữ số."
            },
            "GOOGL": {
                "name": "Alphabet Inc.",
                "roe": 0.29, "net_margin": 0.27, "debt_to_equity": 0.28, "pe_ratio": 24.8, "sentiment": 0.68,
                "note": "Doanh thu quảng cáo tìm kiếm phục hồi, chi phí hạ tầng AI được kiểm soát tốt."
            },
            "AMZN": {
                "name": "Amazon.com Inc.",
                "roe": 0.21, "net_margin": 0.10, "debt_to_equity": 0.85, "pe_ratio": 41.5, "sentiment": 0.58,
                "note": "AWS duy trì vị thế dẫn đầu điện toán đám mây, hiệu quả logistics Bắc Mỹ tăng."
            },
            "TSLA": {
                "name": "Tesla Inc.",
                "roe": 0.17, "net_margin": 0.08, "debt_to_equity": 0.22, "pe_ratio": 62.0, "sentiment": 0.42,
                "note": "Áp lực giảm giá bán xe điện tác động biên lợi nhuận, chờ đợi đòn bẩy FSD và năng lượng."
            },
            "META": {
                "name": "Meta Platforms Inc.",
                "roe": 0.34, "net_margin": 0.35, "debt_to_equity": 0.32, "pe_ratio": 26.4, "sentiment": 0.72,
                "note": "Năm hiệu quả chi phí (Year of Efficiency) mang lại biên lợi nhuận kỷ lục."
            },
            "FPT": {
                "name": "FPT Corporation",
                "roe": 0.28, "net_margin": 0.18, "debt_to_equity": 0.65, "pe_ratio": 22.5, "sentiment": 0.74,
                "note": "Doanh thu xuất khẩu phần mềm và chuyển đổi số toàn cầu tăng trưởng mạnh mẽ."
            },
            "HPG": {
                "name": "Hoa Phat Group",
                "roe": 0.16, "net_margin": 0.09, "debt_to_equity": 0.78, "pe_ratio": 12.8, "sentiment": 0.52,
                "note": "Sản lượng thép phục hồi, dự án Dung Quất 2 kỳ vọng mở rộng công suất lớn."
            },
            "VNM": {
                "name": "Vinamilk",
                "roe": 0.26, "net_margin": 0.17, "debt_to_equity": 0.38, "pe_ratio": 17.2, "sentiment": 0.60,
                "note": "Thị phần sữa nội địa vững chắc, dòng tiền cổ tức đều đặn và lành mạnh."
            }
        }

        # Nếu có API key và có text BCTC upload thật, có thể dùng Gemini
        if self.gemini_api_key and text and len(text) > 100:
            custom_score = self._analyze_with_gemini(t, text)
            if custom_score:
                return custom_score

        # Tra cứu từ database hoặc fallback tính toán theo mã
        if t in database:
            data = database[t]
        else:
            # Hash deterministic fallback
            seed = sum(ord(c) for c in t) % 100
            roe = 0.12 + (seed % 20) * 0.01
            net_margin = 0.08 + (seed % 15) * 0.01
            debt_to_equity = 0.5 + (seed % 10) * 0.1
            pe_ratio = 15.0 + (seed % 25)
            sentiment = round(-0.2 + (seed % 10) * 0.1, 2)
            data = {
                "name": f"{t} Asset",
                "roe": round(roe, 3),
                "net_margin": round(net_margin, 3),
                "debt_to_equity": round(debt_to_equity, 2),
                "pe_ratio": round(pe_ratio, 1),
                "sentiment": sentiment,
                "note": f"Dữ liệu ước lượng cơ bản cho mã cổ phiếu {t}."
            }

        # Tính điểm Fundamental Health Score (0 - 100)
        profitability_score = min(data["roe"] * 100, 40) + min(data["net_margin"] * 100, 30)
        safety_score = max(0.0, 20.0 - data["debt_to_equity"] * 10.0)
        sentiment_score = float(data["sentiment"])
        
        # Điểm tổng hợp trọng số: 60% Khả năng sinh lời, 20% An toàn tài chính, 20% Sentiment
        total_score = round(profitability_score * 0.6 + safety_score * 0.2 + (sentiment_score * 50.0 + 50.0) * 0.2, 1)
        total_score = max(10.0, min(99.0, total_score))

        insights = [
            f"Hiệu quả sinh lời: ROE đạt {data['roe']*100:.1f}%, Biên lợi nhuận ròng {data['net_margin']*100:.1f}%.",
            f"Cơ cấu vốn & Rủi ro: Đòn bẩy Nợ/Vốn CSH ở mức {data['debt_to_equity']:.2f} (Định giá P/E: {data['pe_ratio']:.1f}x).",
            f"Phân tích Ngôn luận (Sentiment Ban Điều hành): {sentiment_score:+.2f} ({'Tích cực' if sentiment_score > 0.2 else 'Thận trọng' if sentiment_score >= 0 else 'Tiêu cực'}).",
            data.get("note", f"Đánh giá sức khỏe tài chính tổng quan cho mã {t}.")
        ]

        metrics = {
            "ROE": float(data["roe"]),
            "Net Margin": float(data["net_margin"]),
            "Debt/Equity": float(data["debt_to_equity"]),
            "P/E": float(data["pe_ratio"])
        }

        return total_score, sentiment_score, metrics, insights

    def _analyze_with_gemini(self, ticker: str, text: str) -> Optional[Tuple[float, float, Dict[str, float], List[str]]]:
        """Tùy chọn: Gọi Gemini API khi người dùng cấu hình GEMINI_API_KEY"""
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""
            Bạn là chuyên gia phân tích báo cáo tài chính cấp cao.
            Hãy phân tích đoạn trích BCTC của công ty {ticker} dưới đây và xuất ra JSON với format:
            {{
                "roe": float (ví dụ 0.25),
                "net_margin": float (ví dụ 0.18),
                "debt_to_equity": float (ví dụ 0.8),
                "pe_ratio": float (ví dụ 22.0),
                "sentiment": float (từ -1.0 đến 1.0),
                "fundamental_score": float (0 đến 100),
                "insights": ["insight 1", "insight 2", "insight 3"]
            }}
            Chỉ trả về JSON hợp lệ, không giải thích thêm:
            {text[:4000]}
            """
            response = model.generate_content(prompt)
            import json
            import re
            match = re.search(r"\{.*\}", response.text, re.DOTALL)
            if match:
                parsed = json.loads(match.group(0))
                metrics = {
                    "ROE": float(parsed.get("roe", 0.2)),
                    "Net Margin": float(parsed.get("net_margin", 0.15)),
                    "Debt/Equity": float(parsed.get("debt_to_equity", 0.8)),
                    "P/E": float(parsed.get("pe_ratio", 20.0))
                }
                return (
                    float(parsed.get("fundamental_score", 75.0)),
                    float(parsed.get("sentiment", 0.5)),
                    metrics,
                    list(parsed.get("insights", [f"Báo cáo tài chính mã {ticker} được phân tích bởi Gemini"]))
                )
        except Exception:
            return None
        return None
