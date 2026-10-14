"use client";

import * as React from "react";

type TextareaProps = React.ComponentPropsWithoutRef<"textarea"> & {
  label?: string;
  wrapperClassName?: string;
};

const textareaStyle =
  "peer block min-h-36 w-full resize-y rounded-lg " +
  "border border-slate-300 bg-gray-50 px-4 pt-7 pb-3 " +
  "text-sm leading-6 text-slate-900 outline-none " +
  "transition-all duration-200 ease-out " +
  "placeholder:text-transparent focus:border-blue-500 " +
  "focus:ring-4 focus:ring-blue-500/10 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50 " +
  "disabled:text-slate-400 aria-invalid:border-red-500 " +
  "aria-invalid:ring-4 aria-invalid:ring-red-500/10 " +
  "dark:border-slate-700 dark:bg-slate-900 " +
  "dark:text-slate-100 dark:focus:border-blue-400";

const labelStyle =
  "pointer-events-none absolute left-4 top-4 " +
  "origin-left text-sm text-slate-500 " +
  "transition-all duration-200 ease-out " +
  "peer-focus:top-2 peer-focus:scale-90 " +
  "peer-focus:text-blue-600 " +
  "peer-[:not(:placeholder-shown)]:top-2 " +
  "peer-[:not(:placeholder-shown)]:scale-90 " +
  "peer-[:not(:placeholder-shown)]:text-slate-500 " +
  "dark:text-slate-400 dark:peer-focus:text-blue-400";

function CustomTextarea({
  id,
  label,
  placeholder,
  className = "",
  wrapperClassName = "",
  ...props
}: TextareaProps) {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;

  if (!label) {
    return (
      <textarea
        id={textareaId}
        placeholder={placeholder}
        className={
          "min-h-24 w-full resize-y rounded-xl border " +
          "border-slate-200 bg-white px-3.5 py-3 text-sm " +
          "text-slate-900 outline-none transition-all " +
          "placeholder:text-slate-400 focus:border-blue-500 " +
          "focus:ring-4 focus:ring-blue-500/10 " +
          "disabled:cursor-not-allowed disabled:opacity-50 " +
          "dark:border-slate-700 dark:bg-slate-900 " +
          "dark:text-slate-100 " +
          className
        }
        {...props}
      />
    );
  }

  return (
    <div className={"relative w-full " + wrapperClassName}>
      <textarea
        id={textareaId}
        placeholder={placeholder || " "}
        className={textareaStyle + " " + className}
        {...props}
      />

      <label htmlFor={textareaId} className={labelStyle}>
        {label}
        {props.required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>
    </div>
  );
}

export { CustomTextarea };