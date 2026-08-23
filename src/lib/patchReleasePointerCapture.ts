/**
 * Firefox/Safari throw `DOMException: Invalid pointer id` when
 * `releasePointerCapture` runs after the capturing node unmounted
 * (Radix Toast swipe, Vaul, dnd-kit). Chrome ignores it.
 */
export function patchReleasePointerCapture() {
  if (typeof Element === "undefined") return;

  const proto = Element.prototype;
  const original = proto.releasePointerCapture;
  if (typeof original !== "function") return;
  if (original.name === "safeReleasePointerCapture") return;

  proto.releasePointerCapture = function safeReleasePointerCapture(pointerId: number) {
    try {
      original.call(this, pointerId);
    } catch {
      /* pointer already gone */
    }
  };
}
