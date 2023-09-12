type SanityInvite = {
  id: string;
  email: string;
  isAccepted: boolean;
  isRevoked: boolean;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  invitedByUserId: string;
  acceptedByUserId: string;
  roles: {
    name: "administrator";
    title: "Administrator";
  }[];
  type: "project";
};

type SanityUserMember = SanityUser & SanityProjectMember & { email: string };
