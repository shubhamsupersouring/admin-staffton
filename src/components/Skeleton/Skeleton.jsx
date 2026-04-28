import React from 'react';
import s from './Skeleton.module.css';

/** Base shimmer rectangle */
export function SkeletonBlock({ className = '', dark = false, ...rest }) {
  return (
    <span
      className={`${s.block} ${dark ? s.blockDark : ''} ${className}`.trim()}
      {...rest}
    />
  );
}

/** Organization details page — matches two-column layout */
export function OrganizationDetailsSkeleton() {
  return (
    <div className={s.pageOrgDetails} aria-busy="true" aria-label="Loading organization details">
      <div className={s.orgTopNav}>
        <SkeletonBlock className={s.orgBackBtn} />
        <SkeletonBlock className={s.orgBreadcrumb} />
      </div>

      <section className={s.orgProfileHeader}>
        <div className={s.orgHeaderInfo}>
          <SkeletonBlock className={s.orgIcon} />
          <div className={s.orgTitleGroup}>
            <SkeletonBlock className={s.orgTitle} />
            <SkeletonBlock className={s.orgMeta} />
          </div>
        </div>
        <div className={s.orgActionGroup}>
          <SkeletonBlock className={s.orgBtn} />
          <SkeletonBlock className={s.orgBtn} />
        </div>
      </section>

      <div className={s.orgGrid}>
        <div className={s.orgMain}>
          {[0, 1, 2, 3].map((idx) => (
            <section key={idx} className={s.orgCard}>
              <div className={s.orgCardHeader}>
                <SkeletonBlock className={s.orgCardIcon} />
                <SkeletonBlock className={s.orgCardTitle} />
              </div>
              <div className={s.orgCardBody}>
                <SkeletonBlock className={s.orgLineLg} />
                <SkeletonBlock className={s.orgLineMd} />
                <div className={s.orgTagRow}>
                  <SkeletonBlock className={s.orgTag} />
                  <SkeletonBlock className={s.orgTag} />
                  <SkeletonBlock className={s.orgTag} />
                </div>
              </div>
            </section>
          ))}
        </div>

        <aside className={s.orgSide}>
          {[0, 1].map((idx) => (
            <section key={idx} className={`${s.orgCard} ${s.orgCardDark}`}>
              <div className={s.orgCardHeader}>
                <SkeletonBlock dark className={s.orgCardIcon} />
                <SkeletonBlock dark className={s.orgCardTitle} />
              </div>
              <div className={s.orgCardBody}>
                <SkeletonBlock dark className={s.orgLineMd} />
                <SkeletonBlock dark className={s.orgLineMd} />
                <SkeletonBlock dark className={s.orgLineSm} />
              </div>
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}

function ListCardSkeleton() {
  return (
    <div className={s.listCard}>
      <div className={s.listTopBar}>
        <SkeletonBlock className={s.listTime} />
        <SkeletonBlock className={s.listSave} />
      </div>
      <div className={s.listBody}>
        <SkeletonBlock className={s.listTitle} />
        <div className={s.listMetaRow}>
          <SkeletonBlock className={s.listMetaPill} />
          <SkeletonBlock className={s.listMetaPill} />
        </div>
        <div className={s.listTags}>
          <SkeletonBlock className={s.listTag} />
          <SkeletonBlock className={s.listTag} />
          <SkeletonBlock className={s.listTag} />
        </div>
        <div className={s.listBottom}>
          <div className={s.listStats}>
            <div className={s.listStatBox}>
              <SkeletonBlock className={s.listStatLabel} />
              <SkeletonBlock className={s.listStatValue} />
            </div>
            <div className={s.listStatBox}>
              <SkeletonBlock className={s.listStatLabel} />
              <SkeletonBlock className={s.listStatValue} />
            </div>
          </div>
          <div className={s.listActions}>
            <SkeletonBlock className={s.listActionBtn} />
            <SkeletonBlock className={s.listActionBtnPrimary} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Organizations list — cards only (header/tabs stay visible) */
export function OrganizationListSkeleton({ count = 4 }) {
  return (
    <div className={s.listGrid} aria-busy="true" aria-label="Loading organizations">
      {Array.from({ length: count }).map((_, i) => (
        <ListCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Onboarding invitation accept — centered card */
export function OnboardingAcceptSkeleton() {
  return (
    <div className={s.obPage} aria-busy="true" aria-label="Verifying invitation">
      <div className={s.obCard}>
        <SkeletonBlock className={s.obLogo} />
        <SkeletonBlock className={s.obTitle} />
        <SkeletonBlock className={s.obSub1} />
        <SkeletonBlock className={s.obSub2} />
        <div className={s.obForm}>
          <div className={s.obField}>
            <SkeletonBlock className={s.obLabel} />
            <SkeletonBlock className={s.obInput} />
          </div>
          <div className={s.obField}>
            <SkeletonBlock className={s.obLabel} />
            <SkeletonBlock className={s.obInput} />
          </div>
          <SkeletonBlock className={s.obSubmit} />
        </div>
      </div>
    </div>
  );
}

/** Admin dashboard — stats + widgets + feed */
export function AdminDashboardSkeleton() {
  return (
    <div className={s.pageDash} aria-busy="true" aria-label="Loading dashboard">
      <header className={s.dashHeader}>
        <div className={s.dashTitleGroup}>
          <SkeletonBlock className={s.dashTitle} />
          <SkeletonBlock className={s.dashSubtitle} />
        </div>
        <SkeletonBlock className={s.dashHeaderBtn} />
      </header>

      <div className={s.dashStatsWrap}>
        <div className={s.dashStatsRow}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={s.dashStatCard}>
              <SkeletonBlock className={s.dashStatIcon} />
              <div className={s.dashStatText}>
                <SkeletonBlock className={s.dashStatValue} />
                <SkeletonBlock className={s.dashStatLabel} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={s.dashLayout}>
        <aside>
          <div className={s.dashWidget}>
            <SkeletonBlock className={s.dashWidgetTitle} />
            <SkeletonBlock className={s.dashActionRow} />
            <SkeletonBlock className={s.dashActionRow} />
          </div>
          <div className={s.dashWidget}>
            <SkeletonBlock className={s.dashWidgetTitle} />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={s.dashActivityRow}>
                <SkeletonBlock className={s.dashActivityAvatar} />
                <div className={s.dashActivityLines}>
                  <SkeletonBlock className={s.dashActivityLine1} />
                  <SkeletonBlock className={s.dashActivityLine2} />
                </div>
              </div>
            ))}
            <SkeletonBlock className={s.dashActionRow} />
          </div>
        </aside>

        <main>
          <div className={s.dashMainHeader}>
            <SkeletonBlock className={s.dashMainTitle} />
            <SkeletonBlock className={s.dashMainLink} />
          </div>
          <div className={s.dashFeed}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={s.dashFeedCard}>
                <SkeletonBlock className={s.dashFeedDate} />
                <SkeletonBlock className={s.dashFeedName} />
                <div className={s.dashFeedMeta}>
                  <SkeletonBlock className={s.dashFeedMetaItem} />
                  <SkeletonBlock className={s.dashFeedMetaItem} />
                </div>
                <div className={s.dashFeedFooter}>
                  <SkeletonBlock className={s.dashFeedBadge} />
                  <SkeletonBlock className={s.dashFeedBtn} />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

/** Settings page — header, tabs, profile card */
export function SettingsSkeleton() {
  return (
    <div className={s.pageSettings} aria-busy="true" aria-label="Loading settings and profile">
      <header className={s.settingsHeader}>
        <SkeletonBlock className={s.settingsTitle} />
        <SkeletonBlock className={s.settingsSaveBtn} />
      </header>
      <div className={s.settingsTabs}>
        <SkeletonBlock className={s.settingsTab} />
        <SkeletonBlock className={s.settingsTabWide} />
      </div>
      <div className={s.settingsProfileWrap}>
        <section className={s.settingsCard}>
          <div className={s.settingsCardHead}>
            <SkeletonBlock className={s.settingsCardIcon} />
            <SkeletonBlock className={s.settingsCardTitle} />
          </div>
          <div className={s.settingsFields}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={s.settingsFieldRow}>
                <SkeletonBlock className={s.settingsLabel} />
                <SkeletonBlock className={s.settingsInput} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/** Invitation details modal — form-shaped rows */
export function ModalFieldsSkeleton() {
  return (
    <div className={s.modalFields} aria-busy="true" aria-label="Loading details">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={s.modalField}>
          <SkeletonBlock className={s.modalLabel} />
          <SkeletonBlock className={s.modalInput} />
        </div>
      ))}
      <div className={s.modalActions}>
        <SkeletonBlock className={s.modalBtn} />
        <SkeletonBlock className={s.modalBtn} />
        <SkeletonBlock className={s.modalBtn} />
      </div>
    </div>
  );
}

/** Wrapper with `position: relative` for `FormSubmitOverlay` + form content */
export function FormOverlayContainer({ children, className = '' }) {
  return <div className={`${s.formOverlayWrap} ${className}`.trim()}>{children}</div>;
}

/**
 * Shown while a form action is in flight (submit, invite send, etc.).
 * Use inside `FormOverlayContainer`.
 */
export function FormSubmitOverlay({ show, message = 'Please wait...', dark = false }) {
  if (!show) return null;
  return (
    <div
      className={`${s.formOverlay} ${dark ? s.formOverlayDark : ''}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={s.formOverlayInner}>
        <div className={s.formOverlayLines}>
          <SkeletonBlock dark={dark} className={s.formOverlayLine} />
          <SkeletonBlock dark={dark} className={s.formOverlayLineShort} />
        </div>
        {message ? <span className={s.formOverlayText}>{message}</span> : null}
      </div>
    </div>
  );
}

/** Full-viewport shell while auth/session is resolving — matches admin layout roughly */
export function ProtectedRouteSkeleton() {
  return (
    <div className={s.prRoot} aria-busy="true" aria-label="Loading application">
      <aside className={s.prSidebar}>
        <SkeletonBlock dark className={s.prLogoLine} />
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonBlock key={i} dark className={i === 2 ? s.prNavLineShort : s.prNavLine} />
        ))}
      </aside>
      <div className={s.prMainCol}>
        <header className={s.prTopBar}>
          <SkeletonBlock className={s.prCrumb} />
          <SkeletonBlock className={s.prBell} />
        </header>
        <div className={s.prContent}>
          <div className={s.prGrid}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={s.prCard}>
                <SkeletonBlock className={s.prCardTitle} />
                <SkeletonBlock className={s.prCardLine} />
                <SkeletonBlock className={s.prCardLineSm} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
