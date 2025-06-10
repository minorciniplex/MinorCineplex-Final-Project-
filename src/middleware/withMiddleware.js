export const withMiddleware = (middlewares, handler) => {
    return async (req, res) => {
      let index = 0;
  
      const next = async () => {
        if (index < middlewares.length) {
          const middleware = middlewares[index];
          index++;
          return await middleware(req, res, next); // ต้อง await middleware
        }
        return await handler(req, res); // ต้อง await handler ด้วย
      };
  
      return await next(); // เริ่มต้นเรียก middleware ตัวแรก
    };
  };
  