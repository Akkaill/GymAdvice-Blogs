import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // อัพเดต state เพื่อแสดง fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error ที่เกิดขึ้นให้ดูใน console
    console.error("💥 Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>มีบางอย่างผิดพลาด (ดู console สำหรับรายละเอียด)</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
