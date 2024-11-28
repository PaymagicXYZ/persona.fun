import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import * as d3 from "d3";

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
            Create an Persona
          </h1>
          <p className="text-[#9a9a9a] text-2xl lg:text-[34px] leading-[45px] max-w-[600px]">
            You need 10M $ANON to create <br /> a new avatar
          </p>
          <Button className="bg-[#C83FD3] w-[114px] h-[57px] hover:bg-[#C83FD3]/90 text-white text-2xl font-bold rounded-xl">
            Create
          </Button>
        </div>
        <svg ref={svgRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};

export default Banner;
