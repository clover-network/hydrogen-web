export function splitNamePrefix(name: string): string {
    const np = name.split('-#')
    if (np[1]) return np[1]
    return name
}