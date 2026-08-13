import { JitsiMeeting } from '@jitsi/react-sdk';
import { JITSI_DOMAIN } from '../config';

// Minimal Jitsi Meet embed: camera & mic off by default (people only appear /
// talk when they explicitly enable them), and all distraction options removed
// (screen share, mute-all, invite, recording, polls, fullscreen, branding...).
export default function JitsiRoom({ roomName, displayName, onEnd }) {
  return (
    <div className="w-full h-full bg-[#0a0a0a] relative">
      <JitsiMeeting
        domain={JITSI_DOMAIN}
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: true,
          prejoinPageEnabled: false,
          disableInviteFunctions: true,
          disableRemoteMute: true,
          disablePolls: true,
          disableRecording: true,
          enableClosePage: false,
          hideConferenceSubject: true,
          hideConferenceTimer: true,
          disableModeratorIndicator: true,
          enableEmailInStats: false,
          disableDeepLinking: true,
          toolbarButtons: ['microphone', 'camera', 'chat', 'raisehand', 'hangup'],
        }}
        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          MOBILE_APP_PROMO: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Agent',
          TOOLBAR_BUTTONS: ['microphone', 'camera', 'chat', 'raisehand', 'hangup'],
        }}
        userInfo={{ displayName }}
        onApiReady={(externalApi) => {
          externalApi.addEventListener('readyToClose', () => {
            if (onEnd) onEnd();
          });
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
          iframeRef.style.border = 'none';
        }}
      />
    </div>
  );
}
