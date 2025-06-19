"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  MultiStepForm,
  MultiStepFormContextProvider,
  MultiStepFormHeader,
  MultiStepFormStep,
  createStepSchema,
  useMultiStepFormContext,
} from "@/components/forms/multi-step-form";
import { Stepper } from "@workspace/ui/components/stepper";
import { logger } from "@/lib/logger";

const FormSchema = createStepSchema({
  account: z.object({
    username: z.string().min(3),
    email: z.string().email(),
  }),
  profile: z.object({
    password: z.string().min(8),
    age: z.coerce.number().min(18),
  }),
});

type FormValues = z.infer<typeof FormSchema>;

export function MultiStepFormDemo() {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      account: {
        username: "",
        email: "",
      },
      profile: {
        password: "",
      },
    },
    reValidateMode: "onBlur",
    mode: "onBlur",
  });

  const onSubmit = (data: FormValues) => {
    logger.log("Form submitted:", data);
  };

  return (
    <MultiStepForm
      className={"space-y-10 p-8 rounded-xl border"}
      schema={FormSchema}
      form={form}
      onSubmit={onSubmit}
    >
      <MultiStepFormHeader
        className={"flex w-full flex-col justify-center space-y-6"}
      >
        <h2 className={"text-xl font-bold"}>Create your account</h2>

        <MultiStepFormContextProvider>
          {({ currentStepIndex }) => (
            <div className="">
              <Stepper
                variant={"numbers"}
                steps={["Account", "Profile", "Details", "Review"]}
                currentStep={currentStepIndex}
              />
            </div>
          )}
        </MultiStepFormContextProvider>
      </MultiStepFormHeader>

      <MultiStepFormStep name="account">
        <AccountStep />
      </MultiStepFormStep>

      <MultiStepFormStep name="profile">
        <ProfileStep />
      </MultiStepFormStep>

      <MultiStepFormStep name="review">
        <ReviewStep />
      </MultiStepFormStep>
    </MultiStepForm>
  );
}

function AccountStep() {
  const { form, nextStep, isStepValid } = useMultiStepFormContext();

  return (
    <Form {...form}>
      <div className={"flex flex-col gap-4"}>
        <FormField
          name="account.username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="account.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button onClick={nextStep} disabled={!isStepValid()}>
            Next
          </Button>
        </div>
      </div>
    </Form>
  );
}

function ProfileStep() {
  const { form, nextStep, prevStep } = useMultiStepFormContext();

  return (
    <Form {...form}>
      <div className={"flex flex-col gap-4"}>
        <FormField
          name="profile.password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="profile.age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type={"button"} variant={"outline"} onClick={prevStep}>
            Previous
          </Button>

          <Button onClick={nextStep}>Next</Button>
        </div>
      </div>
    </Form>
  );
}

function ReviewStep() {
  const { prevStep, form } = useMultiStepFormContext<typeof FormSchema>();
  const values = form.getValues();

  return (
    <div className={"flex flex-col space-y-4"}>
      <div className={"flex flex-col space-y-4"}>
        <div>Great! Please review the values.</div>

        <div className={"flex flex-col space-y-2 text-sm"}>
          <div>
            <span>Username</span>: <span>{values.account.username}</span>
          </div>
          <div>
            <span>Email</span>: <span>{values.account.email}</span>
          </div>
          <div>
            <span>Age</span>: <span>{values.profile.age}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type={"button"} variant={"outline"} onClick={prevStep}>
          Back
        </Button>

        <Button type={"submit"}>Submit</Button>
      </div>
    </div>
  );
}
