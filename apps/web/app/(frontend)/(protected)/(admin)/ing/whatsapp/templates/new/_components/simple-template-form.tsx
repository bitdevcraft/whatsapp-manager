"use client";

import { useForm } from "react-hook-form";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { CategoryEnum, LanguagesEnum, TemplateResponse } from "@workspace/wa-cloud-api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ButtonForm {
  type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';
  text: string;
  url?: string;
  phone_number?: string;
}

interface SimpleTemplateFormValues {
  name: string;
  category: CategoryEnum;
  language: {
    policy: string;
    code: LanguagesEnum;
  };
  body: string;
  buttons: ButtonForm[];
}

export default function SimpleTemplateForm() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue
  } = useForm<SimpleTemplateFormValues>({
    defaultValues: {
      name: "",
      category: CategoryEnum.Marketing,
      language: {
        policy: "deterministic",
        code: LanguagesEnum.English
      },
      body: "",
      buttons: []
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttons, setButtons] = useState<ButtonForm[]>([]);
  const router = useRouter();

  const formatTemplateName = (name: string): string => {
    // Convert to lowercase and replace spaces with underscores
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  };

  const submitToMeta = async (templateData: any) => {
    let response: Response;
    let responseData: any;
    
    try {
      
      // Store the start time for request duration tracking
      const startTime = Date.now();
      
      // Make the API request with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const apiUrl = '/api/whatsapp/templates/submit-to-meta';
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': crypto.randomUUID() // Add a unique request ID for tracking
          },
          body: JSON.stringify(templateData),
          signal: controller.signal,
          credentials: 'include' // Ensure cookies are sent with the request
        });
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        // Log the raw response for debugging
        
        let responseText = '';
        try {
          responseText = await response.text();
          
          // Log the raw response text for debugging
          
          // Try to parse as JSON
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          // If we can't parse as JSON, include the response text in the error
          console.error('Failed to parse JSON response:', {
            status: response.status,
            statusText: response.statusText,
            responseText,
            parseError
          });
          
          return {
            success: false,
            status: response.status,
            statusText: response.statusText,
            error: `Invalid JSON response from server: ${response.status} ${response.statusText}`,
            details: {
              status: response.status,
              statusText: response.statusText,
              responseText: responseText.slice(0, 1000) // Include first 1000 chars of response
            }
          };
        }
        
        // Log the successful response with timing information
        
        if (!response.ok) {
          // Extract error message from different possible response formats
          let errorMessage = 'Failed to submit to Meta';
          const errorDetails: Record<string, any> = {
            status: response.status,
            statusText: response.statusText
          };
          
          if (responseData) {
            if (typeof responseData === 'string') {
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
          
          console.error('Error response from API:', {
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            details: errorDetails
          });
          
          return {
            success: false,
            error: errorMessage,
            details: errorDetails
          };
        }
        
        // Return successful response
        return {
          success: true,
          ...responseData
        };
        
      } catch (fetchError: any) {
        // Handle fetch errors (network issues, timeouts, etc.)
        clearTimeout(timeoutId);
        
        let errorMessage = 'Network error while submitting to Meta';
        const errorDetails: Record<string, any> = {};
        
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request to Meta API timed out';
          errorDetails.timeout = true;
        } else if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to the server';
          errorDetails.networkError = true;
        }
        
        console.error('Fetch error in submitToMeta:', {
          name: fetchError.name,
          message: fetchError.message,
          error: fetchError,
          details: errorDetails
        });
        
        return {
          success: false,
          error: errorMessage,
          details: errorDetails
        };
      }
      
    } catch (error: any) {
      // This catch block is a last resort for any unhandled errors
      console.error('Unexpected error in submitToMeta:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error.response && { response: error.response }),
        ...(error.config && { config: error.config })
      });
      
      return {
        success: false,
        error: 'An unexpected error occurred while submitting to Meta',
        details: {
          name: error.name,
          message: error.message
        }
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
          type: 'BODY',
          text: data.body
        }
      ];
      if (buttons.length > 0) {
        components.push({
          type: 'BUTTONS',
          buttons: buttons.map(btn => ({
            type: btn.type,
            text: btn.text,
            ...(btn.type === 'URL' && btn.url ? { url: btn.url } : {}),
            ...(btn.type === 'PHONE_NUMBER' && btn.phone_number ? { phone_number: btn.phone_number } : {})
          }))
        });
      }

      const templateData = {
        name: formattedName,
        category: data.category,
        language: data.language.code, // Use just the language code
        parameter_format: 'POSITIONAL', // Default to POSITIONAL for simple templates
        components
      };

      // First save to our database
      const saveResponse = await fetch("/api/whatsapp/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save template');
      }
      
      const savedTemplate = await saveResponse.json();
      
      if (!savedTemplate || !savedTemplate.id) {
        throw new Error('Failed to save template to database');
      }
      
      // Then submit to Meta for approval
      const metaResponse = await submitToMeta(savedTemplate);

      if (!metaResponse.success) {
        // Log the complete error response for debugging
        console.error('Meta submission failed with response:', {
          status: metaResponse.status,
          statusText: metaResponse.statusText,
          error: metaResponse.error,
          details: metaResponse.details,
          response: metaResponse.data
        });
        
        // Extract error message from different possible locations in the response
        let errorMessage = 'Failed to submit template to Meta for approval';
        
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
      toast.success('Template created and submitted for approval!');
      
      // Redirect to templates list
      router.push('/ing/whatsapp/templates');
    } catch (err) {
      console.error('Error in template submission:', err);
      
      // Handle different types of errors
      let errorMessage = 'An error occurred while saving the template';
      
      if (err instanceof Error) {
        // Handle Axios errors
        if ('response' in err && err.response) {
          const response = err.response as any;
          if (response.data?.message) {
            errorMessage = response.data.message;
          } else if (response.status === 401) {
            errorMessage = 'Authentication error. Please log in again.';
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        } else {
          // Handle other Error instances
          errorMessage = err.message || errorMessage;
        }
      } else if (typeof err === 'string') {
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
      value: value as LanguagesEnum,
      label: key,
    }));

  const categories = [
    { value: CategoryEnum.Marketing, label: 'Marketing' },
    { value: CategoryEnum.Utility, label: 'Utility' },
    { value: CategoryEnum.Authentication, label: 'Authentication' },
  ];

  // Button types for Meta
  const BUTTON_TYPES = [
    { value: 'URL', label: 'Website URL' },
    { value: 'PHONE_NUMBER', label: 'Phone Number' },
    { value: 'QUICK_REPLY', label: 'Quick Reply' },
  ];

  const handleAddButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { type: 'QUICK_REPLY', text: '' }]);
    }
  };

  const handleRemoveButton = (idx: number) => {
    setButtons(buttons.filter((_, i) => i !== idx));
  };

  const handleButtonChange = (idx: number, field: keyof ButtonForm, value: string) => {
    setButtons(buttons.map((btn, i) => i === idx ? { ...btn, [field]: value } : btn));
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit, onError)} 
      className="space-y-6 max-w-2xl"
      noValidate
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            {...register('name', { 
              required: 'Name is required',
              minLength: {
                value: 3,
                message: 'Name must be at least 3 characters'
              }
            })}
            placeholder="Enter template name"
            className="mt-1"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...register('category', { 
              required: 'Category is required' 
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
            <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            {...register('language.code', { 
              required: 'Language is required' 
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
            <p className="text-sm text-red-500 mt-1">{errors.language.code.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Message Body</Label>
          <textarea
            id="body"
            {...register('body', { 
              required: 'Message body is required',
              minLength: {
                value: 5,
                message: 'Message must be at least 5 characters'
              }
            })}
            placeholder="Enter your message content here"
            className="w-full p-2 border rounded min-h-[100px] disabled:opacity-50"
            disabled={isSubmitting}
          />
          <p className="text-sm text-gray-500">
            Use {"{{1}}"} for variables. Example: "Hello {"{{1}}"}, your order {"{{2}}"} is ready."
          </p>
          {errors.body && (
            <p className="text-sm text-red-500">{errors.body.message}</p>
          )}
        </div>

        {/* Buttons Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Buttons</Label>
            <Button type="button" onClick={handleAddButton} disabled={buttons.length >= 3} size="sm" variant="outline">
              + Add Button
            </Button>
          </div>
          {buttons.length === 0 && <p className="text-xs text-gray-500">You can add up to 3 buttons.</p>}
          {buttons.map((btn, idx) => (
            <div key={idx} className="p-3 border rounded mb-2 bg-gray-50">
              <div className="flex gap-2 items-center mb-2">
                <Label className="w-24">Type</Label>
                <select
                  value={btn.type}
                  onChange={e => handleButtonChange(idx, 'type', e.target.value)}
                  className="border rounded px-2 py-1"
                  disabled={isSubmitting}
                >
                  {BUTTON_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveButton(idx)} disabled={isSubmitting}>
                  &times;
                </Button>
              </div>
              <div className="flex gap-2 items-center mb-2">
                <Label className="w-24">Text</Label>
                <Input
                  value={btn.text}
                  onChange={e => handleButtonChange(idx, 'text', e.target.value)}
                  placeholder="Button text"
                  className="flex-1"
                  disabled={isSubmitting}
                />
              </div>
              {btn.type === 'URL' && (
                <div className="flex gap-2 items-center mb-2">
                  <Label className="w-24">URL</Label>
                  <Input
                    value={btn.url || ''}
                    onChange={e => handleButtonChange(idx, 'url', e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1"
                    disabled={isSubmitting}
                  />
                </div>
              )}
              {btn.type === 'PHONE_NUMBER' && (
                <div className="flex gap-2 items-center mb-2">
                  <Label className="w-24">Phone</Label>
                  <Input
                    value={btn.phone_number || ''}
                    onChange={e => handleButtonChange(idx, 'phone_number', e.target.value)}
                    placeholder="+1234567890"
                    className="flex-1"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Template'}
      </Button>
    </form>
  );
}