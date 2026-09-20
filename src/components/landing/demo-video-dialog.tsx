"use client";

import { MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DemoVideoDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="lg" />}>
        <MonitorPlay />
        Ver Demonstração
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 sm:max-w-3xl">
        {/* Título só pra leitor de tela — o conteúdo visual é o vídeo em si. */}
        <DialogTitle className="sr-only">Demonstração do OptiPrompt</DialogTitle>
        <video
          src="/demonstracao.mp4"
          controls
          autoPlay
          className="aspect-video w-full rounded-xl bg-black"
        >
          Seu navegador não suporta reprodução de vídeo.
        </video>
      </DialogContent>
    </Dialog>
  );
}
