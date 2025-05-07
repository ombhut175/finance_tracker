'use client';

import { Button } from "@/components/ui/button";
import { 
  toastSuccess, 
  toastError, 
  toastInfo, 
  toastWarning 
} from "@/lib/toast";

export function ToastDemo() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold">Toast Notifications Demo</h2>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => toastSuccess("This is a success toast!")}
          variant="default"
        >
          Success Toast
        </Button>
        <Button
          onClick={() => toastError("This is an error toast!")}
          variant="destructive"
        >
          Error Toast
        </Button>
        <Button
          onClick={() => toastInfo("This is an info toast!")}
          variant="outline"
        >
          Info Toast
        </Button>
        <Button
          onClick={() => toastWarning("This is a warning toast!")}
          variant="secondary"
        >
          Warning Toast
        </Button>
      </div>
    </div>
  );
} 