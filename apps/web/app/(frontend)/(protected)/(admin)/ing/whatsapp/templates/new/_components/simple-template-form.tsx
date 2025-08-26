/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { CategoryEnum, LanguagesEnum } from "@workspace/wa-cloud-api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ButtonForm {
  phone_number?: string;
  text: string;
  type: "PHONE_NUMBER" | "QUICK_REPLY" | "URL";
  url?: string;
}

interface SimpleTemplateFormValues {
  body: string;
  buttons: ButtonForm[];
  category: CategoryEnum;
  language: {
    code: LanguagesEnum;
    policy: string;
  };
  name: string;
}

export default function SimpleTemplateForm() {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<SimpleTemplateFormValues>({
    defaultValues: {
      body: "",
      buttons: [],
      category: CategoryEnum.Marketing,
      language: {
        code: LanguagesEnum.English,
        policy: "deterministic",
      },
      name: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setError] = useState<null | string>(null);
  const [buttons, setButtons] = useState<ButtonForm[]>([]);
  const router = useRouter();

  const formatTemplateName = (name: string): string => {
    // Convert to lowercase and replace spaces with underscores
    return name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const submitToMeta = async (templateData: any) => {
    let response: Response;
    let responseData: any;

    try {
      // Store the start time for request duration tracking

      // Make the API request with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const apiUrl = "/api/whatsapp/templates/submit-to-meta";
        response = await fetch(apiUrl, {
          body: JSON.stringify(templateData),
          credentials: "include", // Ensure cookies are sent with the request
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": crypto.randomUUID(), // Add a unique request ID for tracking
          },
          method: "POST",
          signal: controller.signal,
        });

        // Clear the timeout since we got a response
        clearTimeout(timeoutId);

        // Log the raw response for debugging

        let responseText = "";
        try {
          responseText = await response.text();

          // Log the raw response text for debugging

          // Try to parse as JSON
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          // If we can't parse as JSON, include the response text in the error
          console.error("Failed to parse JSON response:", {
            parseError,
            responseText,
            status: response.status,
            statusText: response.statusText,
          });

          return {
            details: {
              responseText: responseText.slice(0, 1000), // Include first 1000 chars of response
              status: response.status,
              statusText: response.statusText,
            },
            error: `Invalid JSON response from server: ${response.status} ${response.statusText}`,
            status: response.status,
            statusText: response.statusText,
            success: false,
          };
        }

        // Log the successful response with timing information

        if (!response.ok) {
          // Extract error message from different possible response formats
          let errorMessage = "Failed to submit to Meta";
          const errorDetails: Record<string, any> = {
            status: response.status,
            statusText: response.statusText,
          };

          if (responseData) {
            if (typeof responseData === "string") {
              errorMessage = responseData;
            } else if (responseData.error) {
              errorMessage = responseData.error.message || responseData.error;
              Object.assign(errorDetails, responseData.error);
            } else if (responseData.message) {
              errorMessage = responseData.message;
            }

            // Include any additional error details from the response
            Object.assign(errorDetails, responseData);
          }

          console.error("Error response from API:", {
            details: errorDetails,
            error: errorMessage,
            status: response.status,
            statusText: response.statusText,
          });

          return {
            details: errorDetails,
            error: errorMessage,
            success: false,
          };
        }

        // Return successful response
        return {
          success: true,
          ...responseData,
        };
      } catch (fetchError: any) {
        // Handle fetch errors (network issues, timeouts, etc.)
        clearTimeout(timeoutId);

        let errorMessage = "Network error while submitting to Meta";
        const errorDetails: Record<string, any> = {};

        if (fetchError.name === "AbortError") {
          errorMessage = "Request to Meta API timed out";
          errorDetails.timeout = true;
        } else if (
          fetchError.name === "TypeError" &&
          fetchError.message.includes("fetch")
        ) {
          errorMessage = "Network error: Unable to connect to the server";
          errorDetails.networkError = true;
        }

        console.error("Fetch error in submitToMeta:", {
          details: errorDetails,
          error: fetchError,
          message: fetchError.message,
          name: fetchError.name,
        });

        return {
          details: errorDetails,
          error: errorMessage,
          success: false,
        };
      }
    } catch (error: any) {
      // This catch block is a last resort for any unhandled errors
      console.error("Unexpected error in submitToMeta:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        ...(error.response && { response: error.response }),
        ...(error.config && { config: error.config }),
      });

      return {
        details: {
          message: error.message,
          name: error.name,
        },
        error: "An unexpected error occurred while submitting to Meta",
        success: false,
      };
    }
  };

  const onSubmit = async (data: SimpleTemplateFormValues) => {
    try {
      setIsSubmitting(true);

      // Format the template name
      const formattedName = formatTemplateName(data.name);

      // Prepare components array
      const components: any[] = [
        {
          text: data.body,
          type: "BODY",
        },
      ];
      if (buttons.length > 0) {
        components.push({
          buttons: buttons.map((btn) => ({
            text: btn.text,
            type: btn.type,
            ...(btn.type === "URL" && btn.url ? { url: btn.url } : {}),
            ...(btn.type === "PHONE_NUMBER" && btn.phone_number
              ? { phone_number: btn.phone_number }
              : {}),
          })),
          type: "BUTTONS",
        });
      }

      const templateData = {
        category: data.category,
        components,
        language: data.language.code, // Use just the language code
        name: formattedName,
        parameter_format: "POSITIONAL", // Default to POSITIONAL for simple templates
      };

      // First save to our database
      const saveResponse = await fetch("/api/whatsapp/templates", {
        body: JSON.stringify(templateData),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save template");
      }

      const savedTemplate = await saveResponse.json();

      if (!savedTemplate || !savedTemplate.id) {
        throw new Error("Failed to save template to database");
      }

      // Then submit to Meta for approval
      const metaResponse = await submitToMeta(savedTemplate);

      if (!metaResponse.success) {
        // Log the complete error response for debugging
        console.error("Meta submission failed with response:", {
          details: metaResponse.details,
          error: metaResponse.error,
          response: metaResponse.data,
          status: metaResponse.status,
          statusText: metaResponse.statusText,
        });

        // Extract error message from different possible locations in the response
        let errorMessage = "Failed to submit template to Meta for approval";

        // Check for error details in the response
        if (metaResponse.data?.error?.message) {
          errorMessage = metaResponse.data.error.message;
        } else if (metaResponse.data?.message) {
          errorMessage = metaResponse.data.message;
        } else if (metaResponse.error) {
          errorMessage = metaResponse.error;
        }

        // Include additional context if available
        if (metaResponse.data?.error?.error_user_msg) {
          errorMessage += ` (${metaResponse.data.error.error_user_msg})`;
        }

        throw new Error(errorMessage);
      }

      // Show success message
      toast.success("Template created and submitted for approval!");

      // Redirect to templates list
      router.push("/ing/whatsapp/templates");
    } catch (err) {
      console.error("Error in template submission:", err);

      // Handle different types of errors
      let errorMessage = "An error occurred while saving the template";

      if (err instanceof Error) {
        // Handle Axios errors
        if ("response" in err && err.response) {
          const response = err.response as any;
          if (response.data?.message) {
            errorMessage = response.data.message;
          } else if (response.status === 401) {
            errorMessage = "Authentication error. Please log in again.";
          } else if (response.status === 403) {
            errorMessage = "You do not have permission to perform this action.";
          } else if (response.status >= 500) {
            errorMessage = "Server error. Please try again later.";
          }
        } else {
          // Handle other Error instances
          errorMessage = err.message || errorMessage;
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.error("Form errors:", errors);
  };

  const languages = Object.entries(LanguagesEnum)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      label: key,
      value: value as LanguagesEnum,
    }));

  const categories = [
    { label: "Marketing", value: CategoryEnum.Marketing },
    { label: "Utility", value: CategoryEnum.Utility },
    { label: "Authentication", value: CategoryEnum.Authentication },
  ];

  // Button types for Meta
  const BUTTON_TYPES = [
    { label: "Website URL", value: "URL" },
    { label: "Phone Number", value: "PHONE_NUMBER" },
    { label: "Quick Reply", value: "QUICK_REPLY" },
  ];

  const handleAddButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { text: "", type: "QUICK_REPLY" }]);
    }
  };

  const handleRemoveButton = (idx: number) => {
    setButtons(buttons.filter((_, i) => i !== idx));
  };

  const handleButtonChange = (
    idx: number,
    field: keyof ButtonForm,
    value: string
  ) => {
    setButtons(
      buttons.map((btn, i) => (i === idx ? { ...btn, [field]: value } : btn))
    );
  };

  return (
    <form
      className="space-y-6 max-w-2xl"
      noValidate
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            {...register("name", {
              minLength: {
                message: "Name must be at least 3 characters",
                value: 3,
              },
              required: "Name is required",
            })}
            className="mt-1"
            disabled={isSubmitting}
            placeholder="Enter template name"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...register("category", {
              required: "Category is required",
            })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            {...register("language.code", {
              required: "Language is required",
            })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          {errors.language?.code && (
            <p className="text-sm text-red-500 mt-1">
              {errors.language.code.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Message Body</Label>
          <textarea
            id="body"
            {...register("body", {
              minLength: {
                message: "Message must be at least 5 characters",
                value: 5,
              },
              required: "Message body is required",
            })}
            className="w-full p-2 border rounded min-h-[100px] disabled:opacity-50"
            disabled={isSubmitting}
            placeholder="Enter your message content here"
          />
          <p className="text-sm text-gray-500">
            Use {"{{1}}"} for variables. Example: &ldquo;Hello {"{{1}}"}, your
            order {"{{2}}"} is ready.&rdquo;
          </p>
          {errors.body && (
            <p className="text-sm text-red-500">{errors.body.message}</p>
          )}
        </div>

        {/* Buttons Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Buttons</Label>
            <Button
              disabled={buttons.length >= 3}
              onClick={handleAddButton}
              size="sm"
              type="button"
              variant="outline"
            >
              + Add Button
            </Button>
          </div>
          {buttons.length === 0 && (
            <p className="text-xs text-gray-500">
              You can add up to 3 buttons.
            </p>
          )}
          {buttons.map((btn, idx) => (
            <div className="p-3 border rounded mb-2 bg-gray-50" key={idx}>
              <div className="flex gap-2 items-center mb-2">
                <Label className="w-24">Type</Label>
                <select
                  className="border rounded px-2 py-1"
                  disabled={isSubmitting}
                  onChange={(e) =>
                    handleButtonChange(idx, "type", e.target.value)
                  }
                  value={btn.type}
                >
                  {BUTTON_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <Button
                  disabled={isSubmitting}
                  onClick={() => handleRemoveButton(idx)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  &times;
                </Button>
              </div>
              <div className="flex gap-2 items-center mb-2">
                <Label className="w-24">Text</Label>
                <Input
                  className="flex-1"
                  disabled={isSubmitting}
                  onChange={(e) =>
                    handleButtonChange(idx, "text", e.target.value)
                  }
                  placeholder="Button text"
                  value={btn.text}
                />
              </div>
              {btn.type === "URL" && (
                <div className="flex gap-2 items-center mb-2">
                  <Label className="w-24">URL</Label>
                  <Input
                    className="flex-1"
                    disabled={isSubmitting}
                    onChange={(e) =>
                      handleButtonChange(idx, "url", e.target.value)
                    }
                    placeholder="https://example.com"
                    value={btn.url || ""}
                  />
                </div>
              )}
              {btn.type === "PHONE_NUMBER" && (
                <div className="flex gap-2 items-center mb-2">
                  <Label className="w-24">Phone</Label>
                  <Input
                    className="flex-1"
                    disabled={isSubmitting}
                    onChange={(e) =>
                      handleButtonChange(idx, "phone_number", e.target.value)
                    }
                    placeholder="+1234567890"
                    value={btn.phone_number || ""}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating..." : "Create Template"}
      </Button>
    </form>
  );
}
