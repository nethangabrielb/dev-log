import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { pixelArt } from "@dicebear/collection";

interface UserAvatarProps {
  seed: string;
  size?: number;
}

export function UserAvatar({ seed, size = 38 }: UserAvatarProps) {
  const svg = useMemo(
    () =>
      createAvatar(pixelArt, {
        seed,
        backgroundColor: ["transparent"],
      }).toString(),
    [seed],
  );

  return (
    <div
      aria-hidden="true"
      className="shrink-0 overflow-hidden rounded-full bg-accent [&_svg]:h-full [&_svg]:w-full"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
