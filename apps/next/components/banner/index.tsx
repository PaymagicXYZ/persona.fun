import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as d3 from "d3";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAccount, useSignTypedData } from "wagmi";
import { waitlistApi } from "@/lib/api/waitlist";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMutation } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import Image from "next/image";

interface FloatingElement {
  id: string;
  src: string;
  alt: string;
  size: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

const Banner = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 440 });
  const [isHovering, setIsHovering] = useState(false);
  const elementsRef = useRef<FloatingElement[]>([
    { id: "moon", src: "/moon.svg", alt: "moon", size: 200 },
    { id: "logo", src: "/xl-logo.svg", alt: "logo", size: 120 },
    { id: "cursor", src: "/cursor.svg", alt: "cursor", size: 100 },
    { id: "star", src: "/star.svg", alt: "star", size: 150 },
  ]);
  const simulationRef = useRef<d3.Simulation<FloatingElement, undefined>>();
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height: 440 });
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!dimensions.width) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (!elementsRef.current[0].x) {
      elementsRef.current.forEach((d) => {
        d.x = Math.random() * (dimensions.width - d.size);
        d.y = Math.random() * (dimensions.height - d.size);
        d.vx = 0;
        d.vy = 0;
      });
    }

    const simulation = d3
      .forceSimulation(elementsRef.current)
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d) => (d as FloatingElement).size / 2)
          .strength(1)
      )
      .alphaDecay(0)
      .velocityDecay(0);

    simulationRef.current = simulation;

    const foreignObjects = svg
      .selectAll("foreignObject")
      .data(elementsRef.current)
      .join("foreignObject")
      .attr("width", (d) => d.size)
      .attr("height", (d) => d.size)
      .style("overflow", "visible")
      .attr("x", (d) => d.x ?? 0)
      .attr("y", (d) => d.y ?? 0);

    foreignObjects.each(function (d) {
      const fo = d3.select(this);
      fo.append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("filter", "drop-shadow(0 0 15px rgba(200, 63, 211, 0.6))")
        .html(
          `<img src="${d.src}" alt="${d.alt}" style="width: 100%; height: 100%; object-fit: contain;" />`
        );
    });

    function ticked() {
      foreignObjects.attr("x", (d) => d.x ?? 0).attr("y", (d) => d.y ?? 0);
    }

    simulation.on("tick", ticked);

    return () => {
      simulation.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions.width]);

  useEffect(() => {
    if (isHovering) {
      elementsRef.current.forEach((d) => {
        d.vx = (Math.random() - 0.5) * 1.5;
        d.vy = (Math.random() - 0.5) * 1.5;
      });

      function animate() {
        elementsRef.current.forEach((d) => {
          if (!d.vx || !d.vy || !d.x || !d.y) return;

          d.x += d.vx;
          d.y += d.vy;

          if (d.x < 0 || d.x > dimensions.width - d.size) {
            d.vx *= -1;
          }
          if (d.y < 0 || d.y > dimensions.height - d.size) {
            d.vy *= -1;
          }

          d.x = Math.max(0, Math.min(dimensions.width - d.size, d.x));
          d.y = Math.max(0, Math.min(dimensions.height - d.size, d.y));

          const acceleration = 0.1;
          d.vx += (Math.random() - 0.5) * acceleration;
          d.vy += (Math.random() - 0.5) * acceleration;

          const maxSpeed = 1.5;
          const currentSpeed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
          if (currentSpeed > maxSpeed) {
            d.vx = (d.vx / currentSpeed) * maxSpeed;
            d.vy = (d.vy / currentSpeed) * maxSpeed;
          }
        });

        simulationRef.current?.alpha(1).restart();
        animationFrameRef.current = requestAnimationFrame(animate);
      }

      animate();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      elementsRef.current.forEach((d) => {
        d.vx = 0;
        d.vy = 0;
      });
      simulationRef.current?.alpha(1).restart();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovering, dimensions.width]);

  return (
    <div
      className="relative w-full min-h-[440px] bg-[#121212] rounded-xl border border-[#222222] overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex flex-col lg:flex-row w-full h-full p-10">
        <div className="flex flex-col gap-7 lg:w-[45%] justify-center z-10">
          <h1 className="text-white text-4xl lg:text-[46px] font-bold leading-[46px]">
            Create an Intern agent+token
          </h1>
          <p className="text-[#9a9a9a] text-2xl lg:text-[34px] leading-[45px] max-w-[600px]">
            Automate your social media 24/7 and tip your biggest fans
          </p>
          <WaitListModal />
        </div>
        <svg ref={svgRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};

enum WaitlistView {
  SignUp,
  Success,
}

function WaitListModal() {
  const [email, setEmail] = useState("");
  const [view, setView] = useState<WaitlistView>(WaitlistView.SignUp);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setView(WaitlistView.SignUp);
      setEmail("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-[114px] h-[57px] bg-[#C83FD3] hover:bg-[#C83FD3]/90 text-white text-2xl font-bold rounded-xl">
        Create
      </DialogTrigger>
      <DialogContent className="bg-[#141414] w-full">
        <DialogHeader>
          <DialogTitle className="font-bold text-3xl leading-9">
            {view === WaitlistView.SignUp
              ? "Create an intern"
              : "Successfully signed up!"}
          </DialogTitle>
          <DialogDescription className="text-base font-medium leading-8">
            {view === WaitlistView.SignUp
              ? "Creating an intern is not opened up to all yet. Please sign up for the waitlist below."
              : "You've successfully signed up for the waitlist. We'll notify you when the waitlist is open."}
          </DialogDescription>
        </DialogHeader>
        {view === WaitlistView.SignUp && (
          <SignUpView setView={setView} email={email} setEmail={setEmail} />
        )}
        {view === WaitlistView.Success && (
          <SuccessView close={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SignUpView({
  setView,
  email,
  setEmail,
}: {
  setView: (view: WaitlistView) => void;
  email: string;
  setEmail: (email: string) => void;
}) {
  const [debouncedEmail] = useDebounce(email, 500);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (email: string) => waitlistApi.addToWaitlist(email),
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (!email) {
      setEmailError(null);
      setIsValidating(false);
      return;
    }

    // Set validating state when email changes
    setIsValidating(true);

    // Reset validation state when debounced validation completes
    if (debouncedEmail) {
      setEmailError(
        !validateEmail(debouncedEmail)
          ? "Please enter a valid email address"
          : null
      );
      setIsValidating(false);
    }
  }, [debouncedEmail, email]);

  const handleSignup = async () => {
    if (emailError) return;

    try {
      await mutateAsync(email);
      setView(WaitlistView.Success);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className="mt-6 space-y-1 relative">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-medium leading-tight"
        >
          Email
        </Label>
        <Input
          id="email"
          placeholder="Email"
          className="py-6"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && (
          <Label className="text-red-500 text-sm mt-1 absolute">
            {emailError}
          </Label>
        )}
      </div>
      <Button
        disabled={isPending || Boolean(emailError) || !email || isValidating}
        onClick={handleSignup}
        className="bg-[#C83FD3] mt-4 w-full hover:bg-[#C83FD3]/90 text-white text-base font-bold rounded-md py-6"
      >
        Sign up
      </Button>
    </>
  );
}

function SuccessView({ close }: { close: () => void }) {
  return (
    <div className="flex flex-col gap-10 items-center mt-6">
      <div className="rounded-full bg-[#231f20] w-[286px] h-[286px] relative flex justify-center items-center overflow-hidden">
        <Image
          className="absolute bottom-[-10px]"
          src="/xl-logo.svg"
          alt="xl-logo"
          width={210}
          height={210}
        />
      </div>
      <Button
        onClick={close}
        className="bg-[#C83FD3] w-full hover:bg-[#C83FD3]/90 text-white text-base font-bold rounded-md py-6"
      >
        Close
      </Button>
    </div>
  );
}

export default Banner;
