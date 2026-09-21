import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card, CardContent, CardTitle } from "../card";
import { Input } from "../input";
import { Label } from "../label";
import { Progress } from "../progress";
import { Separator } from "../separator";
import { Skeleton } from "../skeleton";
import { Textarea } from "../textarea";

describe("primitivos de interface", () => {
  it("mantém semântica e propriedades dos controles", () => {
    render(<><Label htmlFor="campo">Campo</Label><Input id="campo" disabled /><Textarea aria-label="Descrição" /><Button>Salvar</Button></>);
    expect(screen.getByLabelText("Campo")).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Descrição" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });

  it("renderiza os elementos visuais básicos", () => {
    const { container } = render(<><Badge>Novo</Badge><Card><CardTitle>Título</CardTitle><CardContent>Conteúdo</CardContent></Card><Progress value={40} /><Separator /><Skeleton /></>);
    expect(screen.getByText("Novo")).toBeInTheDocument();
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="progress"]')).toBeInTheDocument();
  });
});
