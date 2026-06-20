import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useInitiatePayment, useVerifyPayment, PaymentInputPlan, PaymentInputProvider } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Crown, Check } from "lucide-react";

const schema = z.object({
  plan: z.nativeEnum(PaymentInputPlan),
  provider: z.nativeEnum(PaymentInputProvider),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
});

export default function Vip() {
  const { isAuthenticated, user } = useAuth();
  const initiatePayment = useInitiatePayment();
  const verifyPayment = useVerifyPayment();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { plan: PaymentInputPlan.monthly, provider: PaymentInputProvider.MTN, phone: "" },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (!isAuthenticated) {
      toast.error("Please log in to upgrade to VIP");
      setLocation("/login");
      return;
    }

    initiatePayment.mutate({ data }, {
      onSuccess: (res) => {
        toast.info("Payment initiated. Verifying...");
        // In a real flow, you might redirect to a payment page or wait for a webhook
        // For this demo, we'll try to verify immediately
        setTimeout(() => {
          verifyPayment.mutate({ data: { paymentId: res.paymentId } }, {
            onSuccess: () => {
              toast.success("Welcome to VIP!");
              setLocation("/payment/success");
            },
            onError: () => {
              toast.error("Payment verification failed or pending.");
            }
          });
        }, 2000);
      },
      onError: (err: any) => {
        toast.error(err?.data?.message || "Failed to initiate payment.");
      }
    });
  };

  if (false && user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Crown className="w-16 h-16 text-vip mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">You are already a VIP!</h1>
        <p className="text-muted-foreground mb-8">Enjoy your ad-free, premium cinematic experience.</p>
        <Button asChild size="lg" className="bg-vip text-vip-foreground hover:bg-vip/90">
          <Link href="/movies">Browse VIP Movies</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="text-center mb-12">
        <Crown className="w-12 h-12 text-vip mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Upgrade to VIP</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock exclusive content, watch completely ad-free, and support the cinematic arts.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
        <div className="flex-1 space-y-6">
          <div className="bg-card border border-vip/30 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-vip/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <h3 className="text-2xl font-bold text-white mb-6">VIP Benefits</h3>
            
            <ul className="space-y-4">
              {[
                "Unlimited access to all VIP exclusive movies",
                "Completely ad-free viewing experience",
                "High-quality 4K streaming (where available)",
                "Download movies for offline viewing",
                "Early access to new releases",
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-white/80">
                  <div className="bg-vip/20 rounded-full p-1 mt-0.5 shrink-0">
                    <Check className="w-4 h-4 text-vip" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-card/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6">Select your plan</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Plan</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: PaymentInputPlan.monthly, label: "Monthly", price: "$9.99" },
                            { id: PaymentInputPlan.yearly, label: "Yearly", price: "$99.99", save: "Save 16%" },
                          ].map((p) => (
                            <div 
                              key={p.id}
                              className={`cursor-pointer border rounded-xl p-4 transition-all ${field.value === p.id ? 'border-vip bg-vip/10' : 'border-white/10 bg-black/40 hover:border-white/30'}`}
                              onClick={() => field.onChange(p.id)}
                            >
                              <div className="font-bold text-white">{p.label}</div>
                              <div className="text-xl font-semibold text-vip my-1">{p.price}</div>
                              {p.save && <div className="text-xs text-primary">{p.save}</div>}
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Payment Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/40 border-white/10 h-12">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PaymentInputProvider.MTN}>MTN Mobile Money</SelectItem>
                            <SelectItem value={PaymentInputProvider.AIRTEL}>Airtel Money</SelectItem>
                            <SelectItem value={PaymentInputProvider.FLUTTERWAVE}>Flutterwave (Card)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Phone / Account Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. 0241234567" 
                            className="bg-black/40 border-white/10 focus-visible:ring-vip h-12" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold bg-vip hover:bg-vip/90 text-vip-foreground"
                  disabled={initiatePayment.isPending || verifyPayment.isPending}
                  data-testid="button-submit-payment"
                >
                  {initiatePayment.isPending || verifyPayment.isPending ? "Processing..." : "Complete Upgrade"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By upgrading, you agree to our Terms of Service and authorize this payment.
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
