namespace InternalSEO.Application.Common.Interfaces;

public interface IUrlNormalizer
{
    string Normalize(Uri uri);
    string Normalize(string urlString, Uri baseUri);
    string ComputeSha256Hash(string normalizedUrl);
}
