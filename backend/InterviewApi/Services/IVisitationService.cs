using InterviewApi.Models;

namespace InterviewApi.Services;

public interface IVisitationService
{
    List<Visitation> GetAll();
    List<Visitation> GetFiltered(IEnumerable<int>? hotelIds, int? month, int? year);
    Visitation Add(int customerId, int hotelId, DateTime visitDate);
}
