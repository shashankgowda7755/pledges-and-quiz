"use client";
import React from 'react';
import CountUp from 'react-countup';

export default function CountUpClient({ end }: { end: number }) {
  return <CountUp end={end} duration={2.5} separator="," />;
}
