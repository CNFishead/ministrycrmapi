export default interface MinistryType {
  _id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  ministryType: string;
  leader: string;
  members: string[];
  events: string[];
  announcements: string[];
  features: string[];
  payor: string;
  ownerMinistry: string;
}
