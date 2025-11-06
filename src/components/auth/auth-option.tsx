import { motion } from "framer-motion";
import type { FC, JSX } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

type AuthOptionProps = {
  label: string;
  description: string;
  link: string;
  icon: JSX.Element;
};

export const AuthOption: FC<AuthOptionProps> = ({
  label,
  description,
  link,
  icon,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <Button variant="outline" asChild>
          <a
            href={link}
            className="flex items-center gap-4 w-full text-left p-4"
          >
            {icon}
            <div>
              <h3 className="text-lg font-semibold">{label}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </a>
        </Button>
      </Card>
    </motion.div>
  );
};
