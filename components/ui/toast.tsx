"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cn } from "@/lib/cn";

// Adapted from the shadcn (Base UI) toast: https://ui.shadcn.com/docs/components/base/toast
// Stacking/swipe classes are kept as-is; colors use this project's tokens
// instead of shadcn's, and success/error are tinted green/red.
const toast = ToastPrimitive.createToastManager();

type WithClassName<P> = Omit<P, "className"> & { className?: string };

function ToastViewport({
  className,
  ...props
}: WithClassName<ToastPrimitive.Viewport.Props>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className,
      )}
      {...props}
    />
  );
}

function Toast({ className, ...props }: WithClassName<ToastPrimitive.Root.Props>) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-2xl border border-surface-border bg-surface text-foreground shadow-lg will-change-transform outline-none select-none focus-visible:ring-[3px] focus-visible:ring-primary/50",
        "data-[type=success]:border-transparent data-[type=success]:bg-success data-[type=success]:text-white dark:data-[type=success]:text-background",
        "data-[type=error]:border-transparent data-[type=error]:bg-danger data-[type=error]:text-white dark:data-[type=error]:text-background",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className,
      )}
      {...props}
    />
  );
}

function ToastIcon({ type }: { type: string | undefined }) {
  if (type !== "success" && type !== "error") return null;

  return (
    <span data-slot="toast-icon" className="shrink-0">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {type === "success" ? (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </>
        ) : (
          <>
            <path d="m15 9-6 6" />
            <path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z" />
            <path d="m9 9 6 6" />
          </>
        )}
      </svg>
    </span>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastPrimitive.Content
        data-slot="toast-content"
        className="flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100"
      >
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastPrimitive.Title
            data-slot="toast-title"
            className="text-sm font-semibold"
          />
          <ToastPrimitive.Description
            data-slot="toast-description"
            className="truncate text-sm opacity-80"
          />
        </div>
        <ToastPrimitive.Close
          data-slot="toast-close"
          aria-label="Cerrar notificación"
          className="relative grid size-6 shrink-0 cursor-pointer place-items-center rounded-md opacity-70 transition-opacity after:absolute after:-inset-2 after:content-[''] hover:opacity-100"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </Toast>
  ));
}

function Toaster(props: Omit<ToastPrimitive.Provider.Props, "toastManager">) {
  return (
    <ToastPrimitive.Provider toastManager={toast} {...props}>
      <ToastPrimitive.Portal data-slot="toast-portal">
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

export { Toaster, toast };
