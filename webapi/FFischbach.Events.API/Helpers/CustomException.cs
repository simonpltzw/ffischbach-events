namespace FFischbach.Events.API.Helpers
{
    public class CustomException : Exception
    {
        public string? Detail { get; set; }
        public int StatusCode { get; set; }

        public CustomException(string? title, string? detail = null, int? statusCode = null) : base(title)
        {
            Detail = detail;
            StatusCode = statusCode ?? StatusCodes.Status500InternalServerError;
        }

        public CustomException(string? title, Exception? innerException, string? detail = null, int? statusCode = null) : base(title, innerException)
        {
            Detail = detail;
            StatusCode = statusCode ?? StatusCodes.Status500InternalServerError;
        }

        public override string ToString()
        {
            string message = base.ToString();

            if (Detail != null)
            {
                message += $"{Environment.NewLine}Detail: {Detail}";
            }

            message += $"{Environment.NewLine}HttpStatusCode: {StatusCode}";

            return message;
        }
    }
}
