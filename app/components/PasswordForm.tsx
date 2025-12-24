import {useState} from 'react';
import {Button} from './ui/button';
import {EyeIcon, EyeOffIcon, Loader2} from 'lucide-react';
import {Form, useNavigation} from 'react-router';

interface PasswordFormProps {
  error?: string;
}

export default function PasswordForm({error: serverError}: PasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="max-w-md mx-auto">
      <Form method="post" className="space-y-6">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Your password"
            className="w-full border bg-white px-4 py-3 typo-caption-responsive"
            disabled={isSubmitting}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            disabled={isSubmitting}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {serverError && (
          <div className="text-red-500 typo-caption-responsive">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          variant="black-mint"
          size="lg"
          className="w-full rounded-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Enter'
          )}
        </Button>
      </Form>
    </div>
  );
}
