import { achievements, ranks } from '../data/gamification'
import { useProgress } from '../hooks/useProgress'
import styles from './Achievements.module.css'

export function Achievements() {
  const {
    rank,
    level,
    xp,
    nextRank,
    xpToNext,
    rankProgress,
    streak,
    unlockedIds,
    lessonsDone,
    totalLessons,
    exercisesDone,
    totalExercises,
    missionsDone,
    progressPercent,
    resetProgress,
  } = useProgress()

  const onReset = () => {
    if (confirm('Reset all progress (lessons, labs, missions, XP)? This cannot be undone.')) {
      resetProgress()
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ cat ~/.gitops/profile</p>
        <h2>Achievements</h2>
        <p className={styles.sub}>Your career ladder, badges, and streak. Everything is saved locally — come back anytime.</p>
      </header>

      <section className={styles.rankCard}>
        <div className={styles.rankTop}>
          <span className={styles.rankIcon}>{rank.icon}</span>
          <div className={styles.rankInfo}>
            <h3>{rank.name}</h3>
            <span>level {level} · {xp} XP · 🔥 {streak}-day streak</span>
          </div>
          <span className={styles.pct}>{progressPercent}%</span>
        </div>
        <div className={styles.xpBar}>
          <div className={styles.xpFill} style={{ width: `${rankProgress}%` }} />
        </div>
        <span className={styles.xpHint}>
          {nextRank ? `${xpToNext} XP until ${nextRank.icon} ${nextRank.name}` : 'max rank — GitOps Architect achieved'}
        </span>

        <div className={styles.miniStats}>
          <div><b>{lessonsDone}/{totalLessons}</b><span>lessons</span></div>
          <div><b>{exercisesDone}/{totalExercises}</b><span>labs</span></div>
          <div><b>{missionsDone}/3</b><span>missions</span></div>
          <div><b>{unlockedIds.size}/{achievements.length}</b><span>badges</span></div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.h3}># rank ladder</h3>
        <div className={styles.ladder}>
          {ranks.map((r, i) => (
            <div key={r.name} className={`${styles.rung} ${i <= level ? styles.reached : ''} ${i === level ? styles.current : ''}`}>
              <span className={styles.rungIcon}>{r.icon}</span>
              <span className={styles.rungName}>{r.name}</span>
              <span className={styles.rungXp}>{r.minXp} XP</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.h3}># badges</h3>
        <div className={styles.badges}>
          {achievements.map((a) => {
            const unlocked = unlockedIds.has(a.id)
            return (
              <div key={a.id} className={`${styles.badge} ${unlocked ? styles.unlocked : styles.locked}`}>
                <span className={styles.badgeIcon}>{unlocked ? a.icon : '🔒'}</span>
                <div className={styles.badgeBody}>
                  <strong>{a.name}</strong>
                  <span>{a.description}</span>
                </div>
                <span className={styles.badgeXp}>+{a.xp}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className={styles.section}>
        <button className={styles.resetBtn} onClick={onReset}>↺ reset all progress</button>
      </section>
    </div>
  )
}
