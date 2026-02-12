import { useEffect } from "react";

const useDeviceListener = (onChange) => {
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        onChange("mobile"); // trigger for mobile
      } else if (width <= 1024) {
        onChange("tablet"); // trigger for tablet
      } else {
        onChange("desktop");
      }
    };

    handleResize(); // run on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [onChange]);
};

export default useDeviceListener;
