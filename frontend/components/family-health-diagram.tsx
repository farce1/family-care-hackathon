"use client"

import { useRef } from "react"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { Heart, FileText, Calendar, Pill, Activity, Users, Bell, Shield } from "lucide-react"

const Circle = ({
  className,
  children,
  nodeRef,
}: {
  className?: string
  children?: React.ReactNode
  nodeRef?: React.RefObject<HTMLDivElement | null>
}) => {
  return (
    <div
      ref={nodeRef}
      className={`z-10 flex items-center justify-center rounded-full border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  )
}

export function FamilyHealthDiagram() {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const node1Ref = useRef<HTMLDivElement>(null)
  const node2Ref = useRef<HTMLDivElement>(null)
  const node3Ref = useRef<HTMLDivElement>(null)
  const node4Ref = useRef<HTMLDivElement>(null)
  const node5Ref = useRef<HTMLDivElement>(null)
  const node6Ref = useRef<HTMLDivElement>(null)
  const node7Ref = useRef<HTMLDivElement>(null)
  const node8Ref = useRef<HTMLDivElement>(null)

  return (
    <div
      className="relative flex w-full max-w-lg items-center justify-center overflow-hidden p-10"
      ref={containerRef}
    >
      <div className="flex size-full flex-col items-stretch justify-between gap-10">
        {/* Top Row */}
        <div className="flex justify-between">
          <Circle className="size-14" nodeRef={node1Ref}>
            <FileText className="size-6 text-orange-500" />
          </Circle>
          <Circle className="size-14" nodeRef={node2Ref}>
            <Calendar className="size-6 text-orange-500" />
          </Circle>
          <Circle className="size-14" nodeRef={node3Ref}>
            <Pill className="size-6 text-orange-500" />
          </Circle>
        </div>

        {/* Middle Row with Center Node */}
        <div className="flex justify-between items-center">
          <Circle className="size-14" nodeRef={node4Ref}>
            <Activity className="size-6 text-orange-500" />
          </Circle>

          {/* Center Node - Family Care Platform */}
          <Circle className="size-24 border-4 border-orange-400" nodeRef={centerRef}>
            <div className="flex flex-col items-center justify-center text-center">
              <Heart className="size-10 text-orange-600 fill-orange-500" />
              <span className="text-[10px] font-bold text-orange-700 mt-1 font-[family-name:var(--font-quicksand)]">
                Family Care
              </span>
            </div>
          </Circle>

          <Circle className="size-14" nodeRef={node5Ref}>
            <Users className="size-6 text-orange-500" />
          </Circle>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between">
          <Circle className="size-14" nodeRef={node6Ref}>
            <Bell className="size-6 text-orange-500" />
          </Circle>
          <Circle className="size-14" nodeRef={node7Ref}>
            <Shield className="size-6 text-orange-500" />
          </Circle>
          <Circle className="size-14" nodeRef={node8Ref}>
            <Heart className="size-6 text-orange-500 fill-orange-500" />
          </Circle>
        </div>
      </div>

      {/* Animated Beams - From outer nodes to center */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={node1Ref}
        toRef={centerRef}
        gradientStartColor="oklch(0.72 0.10 60)"
        gradientStopColor="oklch(0.75 0.12 50)"
        duration={3}
        delay={0}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={node2Ref}
        toRef={centerRef}
        gradientStartColor="oklch(0.72 0.10 60)"
        gradientStopColor="oklch(0.75 0.12 50)"
        duration={3}
        delay={0.2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={node3Ref}
        toRef={centerRef}
        gradientStartColor="oklch(0.72 0.10 60)"
        gradientStopColor="oklch(0.75 0.12 50)"
        duration={3}
        delay={0.4}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={node4Ref}
        toRef={centerRef}
        gradientStartColor="oklch(0.72 0.10 60)"
        gradientStopColor="oklch(0.75 0.12 50)"
        duration={3}
        delay={0.6}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={node5Ref}
        toRef={centerRef}
        gradientStartColor="oklch(0.72 0.10 60)"
        gradientStopColor="oklch(0.75 0.12 50)"
        duration={3}
        delay={0.8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={node6Ref}
        toRef={centerRef}
        gradientStartColor="oklch(0.72 0.10 60)"
        gradientStopColor="oklch(0.75 0.12 50)"
        duration={3}
        delay={1}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={node7Ref}
        toRef={centerRef}
        gradientStartColor="oklch(0.72 0.10 60)"
        gradientStopColor="oklch(0.75 0.12 50)"
        duration={3}
        delay={1.2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={node8Ref}
        toRef={centerRef}
        gradientStartColor="oklch(0.72 0.10 60)"
        gradientStopColor="oklch(0.75 0.12 50)"
        duration={3}
        delay={1.4}
      />

      {/* Reverse beams - From center to outer nodes */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={node1Ref}
        reverse={true}
        gradientStartColor="oklch(0.75 0.12 50)"
        gradientStopColor="oklch(0.72 0.10 60)"
        duration={3}
        delay={1.6}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={node2Ref}
        reverse={true}
        gradientStartColor="oklch(0.75 0.12 50)"
        gradientStopColor="oklch(0.72 0.10 60)"
        duration={3}
        delay={1.8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={node3Ref}
        reverse={true}
        gradientStartColor="oklch(0.75 0.12 50)"
        gradientStopColor="oklch(0.72 0.10 60)"
        duration={3}
        delay={2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={node4Ref}
        reverse={true}
        gradientStartColor="oklch(0.75 0.12 50)"
        gradientStopColor="oklch(0.72 0.10 60)"
        duration={3}
        delay={2.2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={node5Ref}
        reverse={true}
        gradientStartColor="oklch(0.75 0.12 50)"
        gradientStopColor="oklch(0.72 0.10 60)"
        duration={3}
        delay={2.4}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={node6Ref}
        reverse={true}
        gradientStartColor="oklch(0.75 0.12 50)"
        gradientStopColor="oklch(0.72 0.10 60)"
        duration={3}
        delay={2.6}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={node7Ref}
        reverse={true}
        gradientStartColor="oklch(0.75 0.12 50)"
        gradientStopColor="oklch(0.72 0.10 60)"
        duration={3}
        delay={2.8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={node8Ref}
        reverse={true}
        gradientStartColor="oklch(0.75 0.12 50)"
        gradientStopColor="oklch(0.72 0.10 60)"
        duration={3}
        delay={3}
      />
    </div>
  )
}
