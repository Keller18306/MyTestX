import { randomUUID } from "crypto";

export function getRandomGUID() {
    return `{${randomUUID().toUpperCase()}}`
}