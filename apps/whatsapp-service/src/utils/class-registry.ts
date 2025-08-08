// lib/registry.ts
import { ulid } from "ulid";

export class Registry<T> {
  private readonly store = new Map<string, T>();

  clear() {
    this.store.clear();
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  get(id: string): T | undefined {
    return this.store.get(id);
  }

  has(id: string): boolean {
    return this.store.has(id);
  }

  register(value: T): string {
    const id = ulid();
    this.store.set(id, value);
    return id;
  }
}
