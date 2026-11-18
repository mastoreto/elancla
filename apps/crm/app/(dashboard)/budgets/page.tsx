import { BudgetsPageContent } from "./components";
import { initialBudgets, ministryOptions, projectOptions } from "./data/budgets";

export default function BudgetsPage() {
  return (
    <BudgetsPageContent
      initialBudgets={initialBudgets}
      ministryOptions={ministryOptions}
      projectOptions={projectOptions}
    />
  );
}
