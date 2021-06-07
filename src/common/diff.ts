export interface Field<T, K extends keyof T = keyof T> {
    name: K
    value: T[K]
}

export default function diff<T extends Object>(curr: T, comp: T): Array<Field<T>> {
    const fields = [] as Array<Field<T>>
    const keys = Object.keys(comp) as Array<keyof T>
    keys.forEach((key) => {
        if (comp[key] !== curr[key]) {
            fields.push({
                name: key,
                value: comp[key]
            })
        }
    })
    return fields
}