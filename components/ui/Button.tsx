import React from "react";
import clsx from "clsx";
import { ButtonProps } from "../../types/ui"

export default function Button({ className, variant = "default", ...props }: ButtonProps) {
  const { type = 'button', ...rest } = props as any
  const base = "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
  const variantClass = variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700" : variant === "secondary" ? "bg-green-600 text-white hover:bg-green-700" : variant === "danger" ? "bg-red-600 text-white hover:bg-red-700" : variant === "ghost" ? "bg-transparent hover:bg-gray-600" : "bg-slate-900 text-white hover:bg-slate-800"
  return (
    <button
      type={type}
      {...rest}
      style={{ position: 'relative', zIndex: 60 }}
      className={clsx(base, variantClass, className)}
    />
  );
}
