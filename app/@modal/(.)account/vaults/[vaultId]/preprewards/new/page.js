/**
 * Reward prep wizard modal.
 */
import Modal from "@/app/_components/Modal";
import RewardPrepWizard from "@/app/_components/rewards/reward-prep-wizard.client";

export default function RewardPrepWizardModal() {
  return (
    <Modal title="Prepare reward">
      <div className="p-6 text-fg">
        <RewardPrepWizard isModal={true} />
      </div>
    </Modal>
  );
}
