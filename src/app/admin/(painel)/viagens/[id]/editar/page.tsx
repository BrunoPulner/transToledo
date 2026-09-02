import {
  EditTripForm,
} from "@/app/components/admin/EditTripForm";

type EditTripPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTripPage({
  params,
}: EditTripPageProps) {
  const { id } = await params;

  return (
    <EditTripForm
      tripId={id}
    />
  );
}