import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group";

interface LookUpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const LookUpInput = ({ ...props }: LookUpInputProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <InputGroup>
      <InputGroupInput
        type={show ? "text" : "password"}
        {...props}
      />
      <InputGroupButton
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => setShow((prev) => !prev)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </InputGroupButton>
    </InputGroup>
  );
};
