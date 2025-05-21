export function clsx(...inputs: (string | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}

export function cn(...inputs: (string | undefined)[]) {
  return clsx(...inputs);
}
