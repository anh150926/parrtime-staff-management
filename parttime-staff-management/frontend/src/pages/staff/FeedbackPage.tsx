/* file: frontend/src/pages/staff/FeedbackPage.tsx */
import React, { useState } from "react";
import { communicationApi } from "../../api/communicationApi";
import { Button } from "../../components/shared/Button";

export const FeedbackPage: React.FC = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await communicationApi.createComplaint({ content });
      alert("Đã gửi khiếu nại thành công. Quản lý sẽ phản hồi sớm.");
      setContent("");
    } catch (e) {
      alert("Lỗi khi gửi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <h2 className="fw-bold mb-4">Gửi Khiếu nại / Góp ý</h2>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <p className="text-muted mb-3">
            Bạn có thắc mắc về lương, lịch làm việc hoặc muốn đóng góp ý kiến?
            Hãy gửi thông tin tại đây (Nội dung sẽ được gửi trực tiếp đến Quản
            lý).
          </p>
          <textarea
            className="form-control mb-3"
            rows={6}
            placeholder="Nhập nội dung..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
          <div className="text-end">
            <Button onClick={handleSubmit} isLoading={loading} icon="bi-send">
              Gửi đi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
