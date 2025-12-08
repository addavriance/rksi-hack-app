import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const redirectTo = (path: string) => {
  if (!document.location.pathname.includes(path)) {
    document.location.pathname = path
  }
}
