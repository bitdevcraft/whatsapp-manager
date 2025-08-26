import { checkoutAction } from "@/lib/payments/actions";
import { Check } from "lucide-react";
import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import { SubmitButton } from "./submit-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const basePlan = products.find((product) => product.name === "Starter");
  const plusPlan = products.find((product) => product.name === "Plus");

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PricingCard
          name={basePlan?.name || "Starter"}
          price={basePrice?.unitAmount || 800}
          interval={basePrice?.interval || "month"}
          trialDays={basePrice?.trialPeriodDays}
          features={[
            "Unlimited Usage",
            "Unlimited Workspace Members",
            "Email Support",
          ]}
          priceId={basePrice?.id}
          productId={basePlan?.id}
        />
        <PricingCard
          name={plusPlan?.name || "Plus"}
          price={plusPrice?.unitAmount || 1200}
          interval={plusPrice?.interval || "month"}
          trialDays={plusPrice?.trialPeriodDays}
          features={[
            "Everything in Base, and:",
            "Early Access to New Features",
            "24/7 Support + Slack Access",
          ]}
          priceId={plusPrice?.id}
          productId={plusPlan?.id}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  productId,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number | null | undefined;
  features: string[];
  priceId?: string;
  productId?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        {trialDays && (
          <p className="text-sm text-muted-foreground mb-4">
            with {trialDays} day free trial
          </p>
        )}
        <p className="text-4xl font-medium text-foreground mb-6">
          ${price / 100}{" "}
          <span className="text-xl font-normal text-muted-foreground">
            per user / {interval}
          </span>
        </p>
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-foreground/50">{feature}</span>
            </li>
          ))}
        </ul>

        <form action={checkoutAction}>
          <input type="hidden" name="priceId" value={priceId} />
          <input type="hidden" name="productId" value={productId} />
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
