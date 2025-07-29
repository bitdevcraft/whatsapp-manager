import { ChangePassword } from "./change-password-form";

export default function SecurityPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium bold text-foreground mb-6">
        Security Settings
      </h1>
      <ChangePassword />
    </section>
  );
}
