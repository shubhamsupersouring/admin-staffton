interface AvatarProps {
    name: string
    size?: "sm" | "md" | "lg" | "xl"
    imageUrl?: string
    alt?: string
}

export function Avatar({ name, size = "lg", imageUrl, alt }: AvatarProps) {
    const getInitials = (userName: string) => {
        if (!userName || typeof userName !== "string") return "?"

        const normalized = userName
            .trim()
            .replace(/-/g, " ")
            .replace(/\s+/g, " ")

        if (!normalized) return "?"

        const words = normalized.split(" ").filter(Boolean)

        if (words.length >= 2) {
            return ((words[0][0] || "") + (words[1][0] || "")).toUpperCase()
        }

        const word = words[0]

        if (word.length === 1) {
            return word.toUpperCase()
        }

        return word.slice(0, 2).toUpperCase()
    }

    const initials = getInitials(name)

    const sizeClasses = {
        sm: "size-7 text-xs",
        md: "size-10 text-sm",
        lg: "size-14 text-lg",
        xl: "size-16 text-xl",
    }

    const shouldShowImage =
        imageUrl && typeof imageUrl === "string" && imageUrl.trim().length > 0

    return (
        <div
            className={`relative   flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-black ${sizeClasses[size]}`}
            aria-label={name || "User avatar"}
            style={{
                backgroundColor: `${imageUrl ? "transparent" : "var(--text-link)"}`,
            }}
        >
            {shouldShowImage ? (
                <img
                    src={imageUrl}
                    alt={alt || name || "User avatar"}
                    loading="lazy"
                    decoding="async"
                    className="size-full rounded-full object-cover"
                />
            ) : (
                <span
                    className="absolute inset-0 flex text-black select-none items-center text-white justify-center leading-none"
                    style={{ lineHeight: 1 }}
                >
                    {initials}
                </span>
            )}
        </div>
    )
}