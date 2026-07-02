import type { DiagramNode } from '../data/exercises'
import styles from './LiveDiagram.module.css'

interface LiveDiagramProps {
  nodes: DiagramNode[]
  concept: string
}

const kindLabel: Record<string, string> = {
  git: 'GIT',
  argo: 'ARGO',
  k8s: 'K8S',
  sync: 'SYNC',
  check: 'GATE',
  cluster: 'LIVE',
  secret: 'VAULT',
}

export function LiveDiagram({ nodes, concept }: LiveDiagramProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <span>live diagram</span>
        <span className={styles.concept}>{concept}</span>
      </div>

      <div className={styles.flow}>
        {nodes.map((node, i) => (
          <div key={i} className={styles.nodeWrap}>
            <div className={`${styles.node} ${styles[node.kind]} ${styles[node.status ?? 'ok']}`}>
              <span className={styles.kind}>{kindLabel[node.kind] ?? node.kind}</span>
              <span className={styles.label}>{node.label}</span>
              {node.detail && <span className={styles.detail}>{node.detail}</span>}
            </div>
            {i < nodes.length - 1 && <span className={styles.arrow}>↓</span>}
          </div>
        ))}
        {nodes.length === 0 && <p className={styles.empty}>start typing to render the diagram</p>}
      </div>

      <div className={styles.legend}>
        <span><i className={styles.dotGit} /> git</span>
        <span><i className={styles.dotArgo} /> controller</span>
        <span><i className={styles.dotLive} /> cluster</span>
        <span><i className={styles.dotWarn} /> incomplete</span>
      </div>
    </div>
  )
}
