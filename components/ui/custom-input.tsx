"use client";

import * as React from "react";

type InputProps = React.ComponentPropsWithoutRef<"input"> & {
  label?: string;
  wrapperClassName?: string;
};

const baseInputStyle =
  "peer block h-12 w-full rounded-lg border border-slate-300 " +
  "bg-gray-50 px-4 text-sm text-slate-900 " +
  "outline-none transition-all duration-200 ease-out " +
  "placeholder:text-transparent focus:border-gray-500 " +
  "focus:ring-4 focus:ring-gray-500/10 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50 " +
  "disabled:text-slate-400 " +
  "aria-invalid:border-red-500 aria-invalid:ring-4 " +
  "aria-invalid:ring-red-500/10 " +
  "dark:border-slate-700 dark:bg-slate-900 " +
  "dark:text-slate-100 dark:focus:border-gray-400 " +
  "dark:disabled:bg-slate-800";

const floatingLabelStyle =
  "pointer-events-none absolute left-4 top-1/2 " +
  "-translate-y-1/2 origin-left text-sm text-slate-500" +
  "transition-all duration-200 ease-out " +
  "peer-focus:-top-6 peer-focus:left-1 peer-focus:translate-y-0 " +
  "peer-focus:scale-90 peer-focus:text-gray-600 peer-focus:font-bold " +
  "peer-[:not(:placeholder-shown)]:-top-6 " +
  "peer-[:not(:placeholder-shown)]:translate-y-0 " +
  "peer-[:not(:placeholder-shown)]:scale-90 " +
  "peer-[:not(:placeholder-shown)]:text-gray-600 peer-[:not(:placeholder-shown)]:font-bold " +
  "dark:text-slate-400 dark:peer-focus:text-gray-400";

function CustomInput({
  id,
  label,
  placeholder,
  className = "",
  wrapperClassName = "",
  type = "text",
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  // Keep legacy inputs working when no floating label is supplied.
  if (!label) {
    return (
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        className={
          "h-11 w-full min-w-0 rounded-xl border border-slate-200 " +
          "bg-white px-3.5 text-sm text-slate-900 outline-none " +
          "transition-all duration-200 placeholder:text-slate-400 " +
          "focus:border-gray-500 focus:ring-4 focus:ring-gray-500/10 " +
          "disabled:cursor-not-allowed disabled:opacity-50 " +
          "aria-invalid:border-red-500 " +
          "dark:border-slate-700 dark:bg-slate-900 " +
          "dark:text-slate-100 " +
          className
        }
        {...props}
      />
    );
  }

  const supportsFloatingLabel =
    type !== "file" &&
    type !== "date" &&
    type !== "datetime-local" &&
    type !== "month" &&
    type !== "week" &&
    type !== "time" &&
    type !== "color" &&
    type !== "range" &&
    type !== "checkbox" &&
    type !== "radio" &&
    type !== "hidden" &&
    type !== "button" &&
    type !== "submit" &&
    type !== "reset" &&
    type !== "image";

  if (!supportsFloatingLabel) {
    return (
      <div className={"space-y-2 " + wrapperClassName}>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          className={
            "h-11 w-full rounded-lg border border-slate-800 " +
            "bg-white px-3.5 text-sm outline-none transition-all " +
            "focus:border-gray-500 focus:ring-4 focus:ring-gray-500/10 " +
            "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 " +
            className
          }
          {...props}
        />
      </div>
    );
  }

  return (
    <div className={"relative w-full " + wrapperClassName}>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder || " "}
        className={baseInputStyle + " " + className}
        {...props}
      />

      <label htmlFor={inputId} className={floatingLabelStyle}>
        {label}
        {props.required && <span className="ml-1 text-red-500">*</span>}
      </label>
    </div>
  );
}

export { CustomInput };
