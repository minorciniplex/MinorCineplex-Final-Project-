export const withMiddleware = (middlewares, handler) => {
    return async (req, res) => {
      let index = 0;
  
      const next = () => {
        if (index < middlewares.length) {
          const middleware = middlewares[index];
          index++;
          return middleware(req, res, next); // เรียกใช้ middleware ถัดไป
        }
        return handler(req, res); // ถ้าผ่าน middleware ทั้งหมดแล้ว ไปที่ handler
      };
  
      return next(); // เริ่มต้นเรียก middleware ตัวแรก
    };
  };
  