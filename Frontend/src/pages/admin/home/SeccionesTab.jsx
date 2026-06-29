import { SectionesEditor } from "../../../components/admin/home_config";

export default function SeccionesTab({ config, onChange, onSectionFlag }) {
  return (
    <SectionesEditor
      config={config}
      onChange={onChange}
      onSectionFlag={onSectionFlag}
    />
  );
}
