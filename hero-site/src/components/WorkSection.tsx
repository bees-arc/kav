'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './WorkSection.module.css';

const projects = [
  { id: 1, title: 'Nebula Brand', category: 'Identity · Film', year: '2026' },
  { id: 2, title: 'Axiom Launch', category: 'Motion · Digital', year: '2025' },
  { id: 3, title: 'Prism Series', category: 'Direction · Edit', year: '2025' },
  { id: 4, title: 'Vanta Campaign', category: 'Film · Identity', year: '2024' },
];

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={styles.card}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.cardNum}>0{index + 1}</div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        <p className={styles.cardCategory}>{project.category}</p>
      </div>
      <span className={styles.cardYear}>{project.year}</span>
      <div className={styles.cardArrow}>↗</div>
    </motion.div>
  );
}

export default function WorkSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="work" className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          ref={ref}
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className={styles.sectionLabel}>Selected Work</span>
          <h2 className={styles.sectionTitle}>
            Our latest <br />
            <span className={styles.gradient}>projects.</span>
          </h2>
        </motion.div>

        <div className={styles.grid}>
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
