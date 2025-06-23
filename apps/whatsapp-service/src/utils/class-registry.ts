// lib/registry.ts
import { ulid } from "ulid";

export class Registry<T> {
  private readonly store = new Map<string, T>();

  register(value: T): string {
    const id = ulid();
    this.store.set(id, value);
    return id;
  }

  get(id: string): T | undefined {
    return this.store.get(id);
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  clear() {
    this.store.clear();
  }

  has(id: string): boolean {
    return this.store.has(id);
  }
}
