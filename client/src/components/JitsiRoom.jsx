import { JitsiMeeting } from '@jitsi/react-sdk';
import { JITSI_DOMAIN } from '../config';

// Remember the player's Jitsi profile (name/email/avatar) once they log in
// (e.g. with Google) so it is kept for future games in this browser.
const JITSI_PROFILE_KEY = 'mafia_jitsi_profile';

function loadJitsiProfile() {
  try {
    return JSON.parse(localStorage.getItem(JITSI_PROFILE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveJitsiProfile(profile) {
  try {
    localStorage.setItem(JITSI_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

// Google-Meet-style embed: everyone joins with audio & video ready and sees
// everyone in a grid (tile view), with the mic/camera buttons to control their
// own feed. Distraction options removed (screen share, mute-all, invite,
// recording, polls, fullscreen, branding...).
export default function JitsiRoom({ roomName, displayName, onEnd }) {
  const stored = loadJitsiProfile();
  return (
    <div className="w-full h-full bg-[#0a0a0a] relative">
      <JitsiMeeting
        domain={JITSI_DOMAIN}
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableInviteFunctions: true,
          disableRemoteMute: true,
          disablePolls: true,
          disableRecording: true,
          enableClosePage: false,
          enableWelcomePage: false,
          hideConferenceSubject: true,
          hideConferenceTimer: true,
          enableEmailInStats: false,
          disableDeepLinking: true,
          remoteVideoMenu: {
            disableKick: true,
            disableGrantModerator: true,
          },
          toolbarButtons: ['microphone', 'camera', 'chat', 'raisehand', 'tileview'],
        }}
        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          MOBILE_APP_PROMO: false,
          HIDE_DEEP_LINKING_LOGO: true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Agent',
          TOOLBAR_BUTTONS: ['microphone', 'camera', 'chat', 'raisehand', 'tileview'],
        }}
        userInfo={{
          displayName: stored.displayName || displayName,
          email: stored.email,
          avatarURL: stored.avatarURL,
        }}
        onApiReady={(externalApi) => {
          externalApi.addEventListener('readyToClose', () => {
            if (onEnd) onEnd();
          });
          let gridEnabled = false;
          const handleProfileUpdate = (event) => {
            if (event && (event.displayName || event.email || event.avatarURL)) {
              saveJitsiProfile({
                displayName: event.displayName || stored.displayName || displayName,
                email: event.email || stored.email,
                avatarURL: event.avatarURL || stored.avatarURL,
              });
            }
          };

          externalApi.addEventListener('videoConferenceJoined', (event) => {
            handleProfileUpdate(event);
            // Show everyone in a grid (Google Meet style) once in the meeting.
            if (!gridEnabled) {
              gridEnabled = true;
              setTimeout(() => {
                try {
                  externalApi.executeCommand('setTileView', true);
                } catch {
                  /* ignore */
                }
              }, 1200);
            }
          });

          externalApi.addEventListener('participantInfoChanged', handleProfileUpdate);
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
          iframeRef.style.border = 'none';
          iframeRef.allow = 'camera; microphone; display-capture; autoplay; clipboard-write; encrypted-media; fullscreen';
        }}
      />
    </div>
  );
}
