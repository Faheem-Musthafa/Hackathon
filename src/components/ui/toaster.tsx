import { useEffect } from "react";

export function Toaster() {
  useEffect(() => {
    alert("Toast initialized!");
  }, []);

  return null; // Or return styled toast component here
}
