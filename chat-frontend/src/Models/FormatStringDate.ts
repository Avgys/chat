export function FormatStringDate(dateStr?: string, options?: Intl.DateTimeFormatOptions) {
    if (!dateStr)
        return '';

    return new Date(dateStr).toLocaleTimeString([], options);
}